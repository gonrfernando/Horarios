from bs4 import BeautifulSoup
import json
import re

nombres = {
    "MAF1121" : "Calculo Integral",
    "MAF3904" : "Fisica Universitaria",
    "MAF092" : "Probabilidad y Estadistica",
    "ESI3892" : "Bases de Datos Relacionales",
    "ESI3911" : "Logica y Estructuras Discretas",
    "ESI3127" : "Programacion Estructurada",
    "DFH02" : "Etica, Identidad y Profesion",
    "MAF1118" : "Algebra Lineal",
    "ESI3114" : "Interconexion de Redes",
    "ESI3895" : "Gestion agil de proyectos",
    "EAM0188" : "Microeconomia",
    "EAM3640" : "Mercadotecnia de contenidos",
    "EAM3634" : "Taller Tecnologias Emergentes Mercadotecnia Buscadores",
    "ESI3181" : "Diseno de estructuras de datos",
    "ESI3933" : "Diseño de estructuras de datos",
    "MAF1123" : "Ecuaciones diferenciales",
    "MAF3968" : "Ecuaciones diferenciales",
    "ESI4216" : "Fundamentos de inteligencia artificial",
    "ESI3188" : "Requerimientos de software",
    "ESI017": "Programacion orientada a objetos",
    "DFH04": "Conocimiento y cultura",
    "DFH03": "Contexto historico social",
    "INT0002": "Conocimiento y cultura",
    'ESI3128': "Programacion orientada a objetos",
    "ESI3891": "Bases de datos no relacionales",
    "ITE4241": "Introduccion a la ingenieria en IA",
    "ESI116": "Analisis y diseño de procesos",
    "ESI3913": "Organización y arquitectura de computadoras",}

def clean_text(t):
    return " ".join(t.split()).strip()

def extract_codigo(text):
    match = re.search(r"[A-Z]{3}\d{2,4}", text.upper())
    return match.group(0) if match else None

def parse_horario(text):

    dias_map = {
        "LUNES": 1, "MARTES": 2, "MIERCOLES": 3, "MIÉRCOLES": 3,
        "JUEVES": 4, "VIERNES": 5, "SABADO": 6, "SÁBADO": 6
    }

    text = text.upper()
    dia = next((dias_map[d] for d in dias_map if d in text), None)
    horas = re.findall(r"(\d{1,2}:\d{2})\s*(AM|PM)?", text)

    inicio = fin = None
    if len(horas) >= 2:
        h0, s0 = horas[0]
        hh0, _ = map(int, h0.split(":"))
        suf0 = s0.upper() if s0 else ""
        if suf0 == "PM" and hh0 != 12:
            hh0 += 12
        if suf0 == "AM" and hh0 == 12:
            hh0 = 0
        inicio = hh0
        h1, s1 = horas[1]
        hh1, _ = map(int, h1.split(":"))
        suf1 = s1.upper() if s1 else ""
        if suf1 == "PM" and hh1 != 12:
            hh1 += 12
        if suf1 == "AM" and hh1 == 12:
            hh1 = 0
        fin = hh1

    return {"dia": dia, "hora-inicio": inicio, "hora-fin": fin}

with open("html-materias.txt", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")
materias_simple = {}

for well in soup.find_all("div", class_="well"):
    panel_group = well.find("div", class_=lambda x: x and "panel-group" in x)
    if not panel_group:
        continue

    codigo_materia = None
    grupos_data = {}

    for p in panel_group.find_all("div", class_="panel"):
        titulo = p.select_one(".panel-title")
        grupo_nombre = clean_text(titulo.get_text()) if titulo else "Sin grupo"

        if not codigo_materia:
            codigo_materia = nombres[extract_codigo(grupo_nombre)] + " - " + extract_codigo(grupo_nombre)
        if not codigo_materia:
            codigo_materia = extract_codigo(well.get_text()) or "MATERIA_DESCONOCIDA"

        body = p.select_one(".panel-body")
        profesor = "Desconocido"
        sesiones = []

        if body:
            prof_label = body.find("label", string=re.compile(r"Profesor", re.I))
            if prof_label:
                sib = prof_label.find_next_sibling("label")
                if sib:
                    profesor = clean_text(sib.get_text())
            bloques = body.find_all(
                "div",
                class_=lambda x: x and "FontRobotoLight" in x and "Fs16" in x and "BoldGray" in x
            )
            for b in bloques:
                label = b.find("label", class_=lambda x: x and "FontRobotoBold" in x)
                if not label:
                    continue
                key = clean_text(label.get_text().replace(":", ""))
                if key.lower().startswith("ses"):
                    val = label.find_next_sibling("label")
                    if val:
                        sesion_info = parse_horario(val.get_text())
                        if sesion_info["dia"] is not None:
                            sesiones.append(sesion_info)

        grupos_data[grupo_nombre] = {
            "profesor": profesor,
            "sesiones": sesiones
        }

    materias_simple[f"O {codigo_materia}"] = grupos_data
    
    
with open("html-materias-verano.txt", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")

for well in soup.find_all("div", class_="well"):
    panel_group = well.find("div", class_=lambda x: x and "panel-group" in x)
    if not panel_group:
        continue

    codigo_materia = None
    grupos_data = {}

    for p in panel_group.find_all("div", class_="panel"):
        titulo = p.select_one(".panel-title")
        grupo_nombre = clean_text(titulo.get_text()) if titulo else "Sin grupo"

        if not codigo_materia:
            codigo_materia = nombres[extract_codigo(grupo_nombre)] + " - " + extract_codigo(grupo_nombre)
        if not codigo_materia:
            codigo_materia = extract_codigo(well.get_text()) or "MATERIA_DESCONOCIDA"

        body = p.select_one(".panel-body")
        profesor = "Desconocido"
        sesiones = []

        if body:
            prof_label = body.find("label", string=re.compile(r"Profesor", re.I))
            if prof_label:
                sib = prof_label.find_next_sibling("label")
                if sib:
                    profesor = clean_text(sib.get_text())
            bloques = body.find_all(
                "div",
                class_=lambda x: x and "FontRobotoLight" in x and "Fs16" in x and "BoldGray" in x
            )
            for b in bloques:
                label = b.find("label", class_=lambda x: x and "FontRobotoBold" in x)
                if not label:
                    continue
                key = clean_text(label.get_text().replace(":", ""))
                if key.lower().startswith("ses"):
                    val = label.find_next_sibling("label")
                    if val:
                        sesion_info = parse_horario(val.get_text())
                        if sesion_info["dia"] is not None:
                            sesiones.append(sesion_info)

        grupos_data[grupo_nombre] = {
            "profesor": profesor,
            "sesiones": sesiones
        }
    
    materias_simple[f"V {codigo_materia}"] = grupos_data
with open("materias_simple.json", "w", encoding="utf-8") as f:
    json.dump(materias_simple, f, ensure_ascii=False, indent=2)

print(f"Archivo simplificado generado correctamente: {len(materias_simple)} materias guardadas en 'materias_simple.json'")
