"""Regenerar con: python -m pip install edge-tts==7.2.8; python generate-voice.py.
Solo envia el guion publico de narration.json a la sintesis de Microsoft.
La presentacion reproduce los MP3 locales y no necesita este script ni Python.
"""
import asyncio
import json
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent

async def main():
    output = ROOT / 'assets' / 'narration'
    output.mkdir(parents=True, exist_ok=True)
    for scene in json.loads((ROOT / 'narration.json').read_text(encoding='utf-8')):
        target = output / (scene['id'] + '.mp3')
        await edge_tts.Communicate(scene['text'], 'es-MX-DaliaNeural', rate='+5%').save(str(target))
        print(f"OK {scene['id']}: {target.stat().st_size} bytes", flush=True)

if __name__ == '__main__':
    asyncio.run(main())
