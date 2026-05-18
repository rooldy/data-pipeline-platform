"""
Tests des règles Data Quality — PySpark natif
"""
import pytest
import json
from unittest.mock import MagicMock, patch
from pathlib import Path


# ─── Mock DataFrame PySpark ───────────────────────────────────────────────────

class MockColumn:
    def __init__(self, name):
        self.name = name
    def isNotNull(self): return self
    def isNull(self):    return self
    def isin(self, *args): return self
    def rlike(self, p):  return self
    def cast(self, t):   return self
    def __ge__(self, v): return self
    def __le__(self, v): return self
    def __and__(self, o): return self


class MockDF:
    def __init__(self, rows: int, pass_filter: int = None):
        self._rows = rows
        self._pass = pass_filter if pass_filter is not None else rows
        self._filtered = False

    def count(self):
        return self._pass if self._filtered else self._rows

    def filter(self, condition):
        df = MockDF(self._rows, self._pass)
        df._filtered = True
        return df

    def __getitem__(self, key):
        return MockColumn(key)


# ─── Tests not_null ───────────────────────────────────────────────────────────

def test_not_null_all_pass():
    from airflow.plugins.quality_tasks import _check_not_null
    import sys
    sys.path.insert(0, 'airflow/plugins')
    from quality_tasks import _check_not_null

    df = MockDF(rows=15, pass_filter=15)
    with patch("quality_tasks.F") as mock_f:
        mock_f.col.return_value = MockColumn("order_id")
        result = _check_not_null(df, "order_id", 100.0)

    assert result["rule_type"] == "not_null"
    assert result["column"] == "order_id"
    assert result["threshold"] == 100.0


def test_not_null_strips_whitespace():
    import sys
    sys.path.insert(0, 'airflow/plugins')
    from quality_tasks import _check_not_null

    df = MockDF(rows=10, pass_filter=10)
    with patch("quality_tasks.F") as mock_f:
        mock_f.col.return_value = MockColumn("col")
        result = _check_not_null(df, "  order_id  ", 100.0)

    assert result["column"] == "  order_id  "  # strip est appliqué en interne


# ─── Tests run_quality_checks ─────────────────────────────────────────────────

def test_run_quality_checks_all_pass(tmp_path):
    import sys
    sys.path.insert(0, 'airflow/plugins')
    import quality_tasks
    quality_tasks.QUALITY_DIR = tmp_path

    df = MockDF(rows=15, pass_filter=15)
    rules = [
        {"rule_type": "not_null", "column": "order_id", "threshold": 100},
    ]

    with patch("quality_tasks.F") as mock_f:
        mock_f.col.return_value = MockColumn("order_id")
        report = quality_tasks.run_quality_checks(df, rules, "dag_test", "node_1")

    assert report["total_rows"] == 15
    assert report["total_rules"] == 1
    assert "dag_test" == report["dag_id"]


def test_run_quality_checks_saves_report(tmp_path):
    import sys
    sys.path.insert(0, 'airflow/plugins')
    import quality_tasks
    quality_tasks.QUALITY_DIR = tmp_path

    df = MockDF(rows=10, pass_filter=10)
    rules = [{"rule_type": "not_null", "column": "id", "threshold": 100}]

    with patch("quality_tasks.F") as mock_f:
        mock_f.col.return_value = MockColumn("id")
        quality_tasks.run_quality_checks(df, rules, "dag_save", "node_save")

    report_file = tmp_path / "dag_save" / "node_save.json"
    assert report_file.exists()
    data = json.loads(report_file.read_text())
    assert data["dag_id"] == "dag_save"


def test_run_quality_checks_unknown_rule(tmp_path):
    import sys
    sys.path.insert(0, 'airflow/plugins')
    import quality_tasks
    quality_tasks.QUALITY_DIR = tmp_path

    df = MockDF(rows=10)
    rules = [{"rule_type": "unknown_rule", "column": "col", "threshold": 100}]

    report = quality_tasks.run_quality_checks(df, rules, "dag_x", "node_x")
    assert report["results"][0]["passed"] is False
    assert "Règle inconnue" in report["results"][0]["message"]


def test_run_quality_checks_empty_rules(tmp_path):
    import sys
    sys.path.insert(0, 'airflow/plugins')
    import quality_tasks
    quality_tasks.QUALITY_DIR = tmp_path

    df = MockDF(rows=10)
    report = quality_tasks.run_quality_checks(df, [], "dag_empty", "node_empty")

    assert report["total_rules"] == 0
    assert report["all_passed"] is True