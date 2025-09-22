import os
import json
import hashlib
import logging
import time
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("text-tools-dapp")

ROLLUP_HTTP_SERVER_URL = os.environ.get("ROLLUP_HTTP_SERVER_URL", "http://127.0.0.1:5004")

# ----------------- Utilitários de protocolo -----------------
def _hex_payload(obj: dict) -> str:
    """Converte dict -> JSON -> bytes -> hex com prefixo 0x (formato esperado pelo dispatcher)."""
    data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
    return "0x" + data.hex()

def create_notice(obj: dict):
    payload = _hex_payload(obj)
    r = requests.post(f"{ROLLUP_HTTP_SERVER_URL}/notice", json={"payload": payload}, timeout=10)
    r.raise_for_status()

def create_report(obj: dict):
    payload = _hex_payload(obj)
    r = requests.post(f"{ROLLUP_HTTP_SERVER_URL}/report", json={"payload": payload}, timeout=10)
    r.raise_for_status()

def finish(status: str):
    """Encerra o ciclo atual e pede o próximo request ao dispatcher."""
    # status: "accept" | "reject"
    r = requests.post(f"{ROLLUP_HTTP_SERVER_URL}/finish", json={"status": status}, timeout=60)
    r.raise_for_status()
    return r.json()  # próximo request

# ----------------- Lógica de negócio (Text Tools) -----------------
def _stats(text: str):
    return {
        "op": "stats",
        "text": text,
        "words": len(text.split()),
        "chars": len(text),
        "sha256": hashlib.sha256(text.encode()).hexdigest(),
    }

def _shout(text: str):
    return {"op": "shout", "text": text.upper()}

def _palindrome(text: str):
    s = "".join(ch.lower() for ch in text if ch.isalnum())
    return {"op": "palindrome", "text": text, "is_palindrome": s == s[::-1]}

def handle_advance(data_bytes: bytes):
    try:
        payload = json.loads(data_bytes.decode())
        op = payload.get("op")
        text = payload.get("text", "")
        if op == "stats":
            create_notice(_stats(text))
        elif op == "shout":
            create_notice(_shout(text))
        elif op == "palindrome":
            create_notice(_palindrome(text))
        else:
            create_report({"error": f"unsupported op: {op}"})
        return "accept"
    except Exception as e:
        create_report({"error": f"bad input: {str(e)}"})
        return "reject"

def handle_inspect(_data_bytes: bytes):
    try:
        info = {
            "ops": ["stats", "shout", "palindrome"],
            "format": {"op": "stats|shout|palindrome", "text": "string"},
            "example": {"op": "stats", "text": "Hello, Cartesi!"}
        }
        create_notice(info)
        return "accept"
    except Exception as e:
        create_report({"error": f"inspect failed: {str(e)}"})
        return "reject"

# ----------------- Loop principal (dispatcher HTTP) -----------------
def main():
    logger.info(f"Starting Text Tools DApp (dispatcher={ROLLUP_HTTP_SERVER_URL})")
    # O protocolo do dispatcher: a cada /finish ele devolve o próximo request:
    # {
    #   "request_type": "advance_state" | "inspect_state",
    #   "data": {
    #       "payload": "0x...."
    #   }
    # }
    while True:
        try:
            req = finish("accept")  # pede o próximo request
            req_type = req.get("request_type")
            data = req.get("data", {})
            payload_hex = data.get("payload", "0x")
            data_bytes = bytes.fromhex(payload_hex[2:]) if payload_hex.startswith("0x") else b""

            if req_type == "advance_state":
                status = handle_advance(data_bytes)
            elif req_type == "inspect_state":
                status = handle_inspect(data_bytes)
            else:
                # Desconhecido; apenas reporta e segue
                create_report({"error": f"unknown request_type: {req_type}"})
                status = "reject"

            # Informa o status da execução e solicita o próximo request
            finish(status)
        except requests.RequestException as e:
            # Se o servidor ainda não está pronto, espera e tenta de novo
            logger.warning(f"dispatcher not ready or http error: {e}; retrying in 1s")
            time.sleep(1)
        except Exception as e:
            logger.exception(f"unexpected error: {e}; retrying in 1s")
            time.sleep(1)

if __name__ == "__main__":
    main()
