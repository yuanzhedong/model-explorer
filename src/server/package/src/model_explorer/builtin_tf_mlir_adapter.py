import os
from typing import Dict

from model_explorer_adapter import \
    _pywrap_convert_wrapper as convert_wrapper  # type: ignore

from .adapter import Adapter, AdapterMetadata
from .types import ModelExplorerGraphs
from .utils import convert_builtin_resp, ensure_tf_model_name


class BuiltinTfMlirAdapter(Adapter):
  """Built-in tf adapter using MLIR."""

  metadata = AdapterMetadata(id='builtin_tf_mlir',
                             name='TF adapter (MLIR)',
                             description='A built-in adapter that converts a TF saved model to Model Explorer format through MLIR.',
                             fileExts=['pb'])

  def __init__(self):
    super().__init__()

  def convert(self, model_path: str, settings: Dict) -> ModelExplorerGraphs:
    # Construct config.
    config = convert_wrapper.VisualizeConfig()
    if 'const_element_count_limit' in settings:
      config.const_element_count_limit = settings['const_element_count_limit']

    # Normalize model_path
    model_dir = model_path
    if model_path.endswith('.pb'):
      model_dir = ensure_tf_model_name(model_path)

    # Run
    resp_json_str = convert_wrapper.ConvertSavedModelToJson(
        config, model_dir)
    return {'graphCollections': convert_builtin_resp(resp_json_str)}