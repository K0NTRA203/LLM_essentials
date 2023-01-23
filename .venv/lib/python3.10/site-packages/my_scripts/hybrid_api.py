from typing import List, Dict, Union, Tuple
from dataclasses import dataclass

@dataclass
class Vector():
    values: List[float]

@dataclass
class SparseVector():
    values: Dict[int, float]

class HybridVector():
    def __init__(self, vector: Vector, sparse_vector: SparseVector):
        self._dense_values = vector
        self._sparse_values: sparse_vector

    @property
    def values(self) -> Tuple[List[float], Dict[int, float]]:
        return (self._dense_values, self._sparse_values)


@dataclass
class Record():
    id: str
    vector: Union[Vector, SparseVector, HybridVector]
    metadata: Dict[str, float]


def upsert(records: List[Record]): # <- Note: we don't support tuples here!
    #  DO stuff here
    pass