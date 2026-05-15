"""
Data Quality Tasks — PySpark natif
Validation des données sans dépendance externe
"""
import os
import json
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

QUALITY_DIR = Path(os.getenv("QUALITY_DIR", "/data/quality"))


# ─── Règles de validation ─────────────────────────────────────────────────────

def _check_not_null(df, column: str, threshold: float) -> dict:
    from pyspark.sql import functions as F
    total     = df.count()
    not_null  = df.filter(F.col(column).isNotNull()).count()
    rate      = round(not_null / total * 100, 2) if total > 0 else 0
    passed    = rate >= threshold
    return {
        "rule_type": "not_null",
        "column": column,
        "threshold": threshold,
        "actual": rate,
        "passed": passed,
        "message": f"{not_null}/{total} valeurs non nulles ({rate}%)",
    }


def _check_regex(df, column: str, pattern: str, threshold: float) -> dict:
    from pyspark.sql import functions as F
    total    = df.count()
    matching = df.filter(F.col(column).rlike(pattern)).count()
    rate     = round(matching / total * 100, 2) if total > 0 else 0
    passed   = rate >= threshold
    return {
        "rule_type": "regex",
        "column": column,
        "pattern": pattern,
        "threshold": threshold,
        "actual": rate,
        "passed": passed,
        "message": f"{matching}/{total} valeurs correspondent au pattern ({rate}%)",
    }


def _check_range(df, column: str, min_value, max_value, threshold: float) -> dict:
    from pyspark.sql import functions as F
    total = df.count()
    cond  = F.col(column).isNotNull()
    if min_value is not None:
        cond = cond & (F.col(column).cast("double") >= float(min_value))
    if max_value is not None:
        cond = cond & (F.col(column).cast("double") <= float(max_value))
    in_range = df.filter(cond).count()
    rate     = round(in_range / total * 100, 2) if total > 0 else 0
    passed   = rate >= threshold
    bounds   = f"[{min_value}, {max_value}]"
    return {
        "rule_type": "range",
        "column": column,
        "min_value": min_value,
        "max_value": max_value,
        "threshold": threshold,
        "actual": rate,
        "passed": passed,
        "message": f"{in_range}/{total} valeurs dans {bounds} ({rate}%)",
    }


def _check_in_set(df, column: str, values: list, threshold: float) -> dict:
    total    = df.count()
    in_set   = df.filter(df[column].isin(values)).count()
    rate     = round(in_set / total * 100, 2) if total > 0 else 0
    passed   = rate >= threshold
    return {
        "rule_type": "in_set",
        "column": column,
        "values": values,
        "threshold": threshold,
        "actual": rate,
        "passed": passed,
        "message": f"{in_set}/{total} valeurs dans l'ensemble autorisé ({rate}%)",
    }


# ─── Runner principal ─────────────────────────────────────────────────────────

def run_quality_checks(df, rules: list, dag_id: str, node_id: str) -> dict:
    """
    Exécute les règles de qualité sur un DataFrame PySpark.
    Retourne le rapport complet et le sauvegarde en JSON.
    """
    total_rows = df.count()
    logger.info(f"🔍 Démarrage Data Quality : {len(rules)} règles sur {total_rows} lignes")

    results = []
    for rule in rules:
        rule_type = rule.get("rule_type", "")
        column    = rule.get("column", "")
        threshold = float(rule.get("threshold", 100))

        try:
            if rule_type == "not_null":
                result = _check_not_null(df, column, threshold)

            elif rule_type == "regex":
                result = _check_regex(df, column, rule.get("pattern", ".*"), threshold)

            elif rule_type == "range":
                result = _check_range(df, column,
                    rule.get("min_value"), rule.get("max_value"), threshold)

            elif rule_type == "in_set":
                values = rule.get("values", [])
                if isinstance(values, str):
                    values = [v.strip() for v in values.split(",")]
                result = _check_in_set(df, column, values, threshold)

            else:
                result = {
                    "rule_type": rule_type, "column": column,
                    "passed": False, "message": f"Règle inconnue : {rule_type}"
                }

            icon = "✅" if result["passed"] else "❌"
            logger.info(f"  {icon} [{rule_type}] {column} → {result['message']}")
            results.append(result)

        except Exception as e:
            logger.error(f"  ❌ Erreur règle [{rule_type}] {column} : {e}")
            results.append({
                "rule_type": rule_type, "column": column,
                "passed": False, "message": f"Erreur : {str(e)}"
            })

    passed_count = sum(1 for r in results if r["passed"])
    all_passed   = passed_count == len(results)

    report = {
        "dag_id":        dag_id,
        "node_id":       node_id,
        "timestamp":     datetime.utcnow().isoformat(),
        "total_rows":    total_rows,
        "total_rules":   len(results),
        "passed_rules":  passed_count,
        "failed_rules":  len(results) - passed_count,
        "all_passed":    all_passed,
        "results":       results,
    }

    # Sauvegarder le rapport
    report_dir = QUALITY_DIR / dag_id
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / f"{node_id}.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))

    status = "✅ PASS" if all_passed else "❌ FAIL"
    logger.info(f"📊 Rapport qualité : {status} — {passed_count}/{len(results)} règles")
    return report


def load_quality_report(dag_id: str, node_id: str) -> dict | None:
    """Charge le rapport de qualité d'un nœud"""
    path = QUALITY_DIR / dag_id / f"{node_id}.json"
    if path.exists():
        return json.loads(path.read_text())
    return None


def list_quality_reports(dag_id: str) -> list:
    """Liste tous les rapports de qualité d'un DAG"""
    dag_dir = QUALITY_DIR / dag_id
    if not dag_dir.exists():
        return []
    return [
        json.loads(f.read_text())
        for f in sorted(dag_dir.glob("*.json"))
    ]