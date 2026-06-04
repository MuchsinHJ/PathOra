import numpy as np, re, joblib, torch
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import backend as K
from transformers import AutoTokenizer, AutoModel

class FeatureAttention(keras.layers.Layer):
    def __init__(self, **kw): super().__init__(**kw)
    def build(self, s): self.W = self.add_weight(shape=(s[-1],), initializer="ones", trainable=True)
    def call(self, x): return x * tf.nn.softmax(self.W)

@keras.saving.register_keras_serializable()
def focal_loss(g=2.0, a=0.5):
    def fn(y, p):
        y = tf.squeeze(tf.cast(y, tf.int32))
        p = K.clip(p, K.epsilon(), 1-K.epsilon())
        ce = tf.nn.sparse_softmax_cross_entropy_with_logits(labels=y, logits=tf.math.log(p+K.epsilon()))
        idx = tf.stack([tf.range(tf.shape(p)[0], dtype=tf.int32), y], axis=-1)
        return K.mean(a * K.pow(1-tf.gather_nd(p,idx), g) * ce)
    return fn

class PathOraPredictor:
    def __init__(self, model_path="pathora_model.keras", le_path="extracted/label_encoder.joblib"):
        self.model = keras.models.load_model(model_path, custom_objects={
            "FeatureAttention": FeatureAttention, "loss_fn": focal_loss()
        })
        self.le = joblib.load(le_path)
        self.tokenizer = AutoTokenizer.from_pretrained("indobenchmark/indobert-base-p2")
        self.bert = AutoModel.from_pretrained("indobenchmark/indobert-base-p2")
        self.bert.eval()
        self.max_len = 128

    def predict(self, text, top_n=5):
        text = re.sub(r"<[^>]+>", " ", re.sub(r"\s+", " ", text)).strip()
        tok = self.tokenizer([text], padding=True, truncation=True, max_length=self.max_len, return_tensors="pt")
        with torch.no_grad():
            out = self.bert(**tok)
        emb = out.last_hidden_state[:, 0, :].numpy()
        probs = self.model.predict(emb, verbose=0)[0]
        top = np.argsort(probs)[::-1][:top_n]
        return [(self.le.classes_[i], float(probs[i])) for i in top]

if __name__ == "__main__":
    p = PathOraPredictor()
    for s in ["Python developer, TensorFlow, AWS.",
              "Financial analyst, CFA, Excel.",
              "Nurse, ICU, BLS."]:
        print("Text:", s)
        for cat, conf in p.predict(s):
            print(f"  {cat}: {conf:.1%}")
        print()
