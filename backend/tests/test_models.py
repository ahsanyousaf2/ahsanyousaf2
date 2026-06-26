import pytest
import numpy as np
from models import get_model, MODEL_REGISTRY


class TestModelFactory:
    def test_get_hybrid_model(self):
        model = get_model("hybrid")
        assert model is not None
        assert model.get_name() == "Hybrid(BiRefNet+RMBG)"

    def test_get_birefnet_model(self):
        model = get_model("birefnet")
        assert model is not None
        assert model.get_name() == "BiRefNet"

    def test_get_rmbg_model(self):
        model = get_model("rmbg")
        assert model is not None
        assert model.get_name() == "RMBG-2.0"

    def test_get_u2net_model(self):
        model = get_model("u2net")
        assert model is not None
        assert model.get_name() == "U2Net"

    def test_get_isnet_model(self):
        model = get_model("isnet")
        assert model is not None
        assert model.get_name() == "ISNet"

    def test_invalid_model_raises(self):
        import pytest
        with pytest.raises(ValueError):
            get_model("nonexistent")

    def test_all_models_in_registry(self):
        expected = {"birefnet", "rmbg", "u2net", "isnet", "hybrid"}
        assert set(MODEL_REGISTRY.keys()) == expected
