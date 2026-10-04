import pypdf
import re
import json
import os

pdf_path = r'C:\Users\Anton\.gemini\antigravity-ide\brain\44cb6469-8c15-483f-ae2a-d398807a5fe1\.user_uploaded\media_1790034068193.pdf'
out_path = r'c:\Users\Anton\Documents\AnaliseFiat\backend\config\tcc_symptoms.json'

reader = pypdf.PdfReader(pdf_path)
print(f"Lendo PDF com {len(reader.pages)} páginas...")

category_ranges = [
    ("Motor", 8, 122),
    ("Freios", 123, 139),
    ("Suspensão", 141, 177),
    ("Elétrica", 182, 261),
    ("Transmissão", 264, 317)
]

FIELD_NAMES = [
    "Descrição detalhada",
    "Nível de dificuldade",
    "Tempo estimado de reparo",
    "Ferramentas necessárias",
    "Peças prováveis (confirmar)",
    "Passo a passo / fluxo de reparo",
    "Cuidados e segurança",
    "Aplicação",
    "Nível de evidência",
    "Fonte / observação"
]

STOP_WORDS = {
    'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para',
    'com', 'sem', 'sob', 'sobre', 'ou', 'e', 'um', 'uma', 'uns', 'umas', 'o', 'a',
    'os', 'as', 'que', 'se', 'ao', 'aos', 'fiat', 'muito', 'apos', 'somente', 'pelo',
    'pela', 'pelos', 'pelas'
}

def normalize_text_for_tokens(text):
    if not text:
        return []
    import unicodedata
    normalized = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode('utf-8')
    tokens = re.findall(r'[a-zA-Z0-9]+', normalized.lower())
    return [t for t in tokens if len(t) >= 3 and t not in STOP_WORDS]

def map_difficulty(diff_str):
    diff = (diff_str or '').lower()
    if 'baixa' in diff:
        return 'Fácil'
    if 'alta' in diff or 'especialista' in diff:
        return 'Difícil'
    return 'Mediano'

def map_probability(evid_str, diff_str):
    s = (evid_str or '') + ' ' + (diff_str or '')
    s = s.lower()
    if 'alta' in s or 'cronico' in s or 'recall' in s or 'documentado' in s:
        return 'Alta'
    if 'baixa' in s:
        return 'Baixa'
    return 'Média'

card_header_pattern = re.compile(r'(FIAT-\d{4})\s*-\s*([^\n\r]+)')

all_catalog = []
category_stats = {}

for cat_name, start_idx, end_idx in category_ranges:
    cat_items = []
    for page_idx in range(start_idx, end_idx):
        text = reader.pages[page_idx].extract_text()
        matches = list(card_header_pattern.finditer(text))
        
        for m_idx, match in enumerate(matches):
            fiat_id = match.group(1).strip()
            title = match.group(2).strip()
            
            start_pos = match.end()
            end_pos = matches[m_idx + 1].start() if m_idx + 1 < len(matches) else len(text)
            card_body = text[start_pos:end_pos]
            
            field_positions = []
            for field in FIELD_NAMES:
                pattern = re.escape(field)
                f_match = re.search(pattern, card_body)
                if f_match:
                    field_positions.append((f_match.start(), f_match.end(), field))
            
            field_positions.sort(key=lambda x: x[0])
            fields_data = {}
            for i, (f_start, f_end, f_name) in enumerate(field_positions):
                val_start = f_end
                val_end = field_positions[i + 1][0] if i + 1 < len(field_positions) else len(card_body)
                val = card_body[val_start:val_end].strip()
                val = re.sub(r'Base TCC - Auxilio ao Diagnostico Fiat\s*Pagina \d+', '', val).strip()
                fields_data[f_name] = val
                
            desc_detalhada = fields_data.get("Descrição detalhada", f"O problema '{title}' afeta o funcionamento normal do sistema de {cat_name.lower()}.")
            dificuldade_raw = fields_data.get("Nível de dificuldade", "Média")
            tempo_est = fields_data.get("Tempo estimado de reparo", "0,5-4 h")
            ferramentas = fields_data.get("Ferramentas necessárias", "Scanner OBD; multímetro; ferramentas manuais de oficina")
            pecas_prov = fields_data.get("Peças prováveis (confirmar)", f"Componentes relacionados a {title.lower()} conforme diagnóstico.")
            passos = fields_data.get("Passo a passo / fluxo de reparo", "1. Confirmar o sintoma informado.\n2. Inspecionar visualmente conexões e chicotes.\n3. Ler parâmetros no scanner OBD.\n4. Reparar ou substituir componente confirmado.\n5. Realizar teste de rodagem.")
            cuidados = fields_data.get("Cuidados e segurança", "ATENÇÃO: Sistema crítico. Seguir procedimentos do manual de serviço e normas de segurança.")
            aplicacao = fields_data.get("Aplicação", "Diversos modelos Fiat")
            evidencia = fields_data.get("Nível de evidência", "Condição mecânica/elétrica possível")
            fonte = fields_data.get("Fonte / observação", "Estimativa técnica geral; manual de serviço Fiat")
            
            # Keywords inteligentes
            tokens = set()
            tokens.update(normalize_text_for_tokens(title))
            tokens.update(normalize_text_for_tokens(pecas_prov))
            tokens.add(cat_name.lower())
            tokens.add(fiat_id.lower())
            
            # Se for específico de algum modelo
            for model in ['argo', 'cronos', 'mobi', 'pulse', 'fastback', 'strada', 'toro', 'freemont', 'palio', 'uno', 'siena', 'punto']:
                if model in aplicacao.lower() or model in title.lower():
                    tokens.add(model)
            
            # Mapeamento para estrutura de catálogo do AnaliseFiat
            symptom_item = {
                "codigo_fiat": fiat_id,
                "codigo_obd": fiat_id,
                "nome": title,
                "descricao": desc_detalhada,
                "categoria": cat_name,
                "keywords": sorted(list(tokens)),
                "causes": [
                    {
                        "nome": pecas_prov if len(pecas_prov) < 120 else pecas_prov[:117] + "...",
                        "descricao": f"Aplicação: {aplicacao}. Evidência: {evidencia}. {pecas_prov}",
                        "probabilidade": map_probability(evidencia, dificuldade_raw),
                        "repairGuides": [
                            {
                                "titulo": f"Fluxo de Reparo: {title}",
                                "descricao": f"{cuidados} (Fonte: {fonte})",
                                "passos": passos,
                                "tempo_estimado": tempo_est,
                                "dificuldade": map_difficulty(dificuldade_raw),
                                "ferramentas": ferramentas
                            }
                        ]
                    }
                ]
            }
            cat_items.append(symptom_item)
            all_catalog.append(symptom_item)
            
    category_stats[cat_name] = len(cat_items)

print("Contagem por categoria:")
for cat, count in category_stats.items():
    print(f"  - {cat}: {count} registros")
print(f"Total de registros catalogados: {len(all_catalog)}")

os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(all_catalog, f, ensure_ascii=False, indent=2)

print(f"Arquivo gerado com sucesso em: {out_path}")
