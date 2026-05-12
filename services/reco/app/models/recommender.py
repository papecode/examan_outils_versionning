import joblib
import numpy as np
from pathlib import Path
import logging
import random

logger = logging.getLogger(__name__)

class Recommender:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        try:
            if Path(self.model_path).exists():
                self.model = joblib.load(self.model_path)
                logger.info(f"Modèle chargé: {self.model_path}")
                return True
            else:
                logger.warning(f"Modèle non trouvé: {self.model_path}")
                return False
        except Exception as e:
            logger.error(f"Erreur: {e}")
            return False
    
    def get_recommendations(self, user_id: int, top_n: int = 5) -> list:
        if self.model is None:
            raise ValueError("Modèle non chargé")
        
        # Pour le moment, recommandations aléatoires
        # À remplacer par la vraie logique du modèle
        return random.sample(range(1, 101), min(top_n, 100))
