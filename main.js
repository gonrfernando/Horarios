function drawCalendar(selected_groups, materias) {
    for (const cell of document.querySelectorAll("#calendar-body td")) {
        cell.innerHTML = "";
    }
    selected_groups.forEach((grupo,index) => {
        const calendarTable = document.getElementById("calendar-body");
        const codigo = grupo.dataset.codigo;
        const grupoNombre = grupo.textContent.split(" - ")[0];
        const sesiones = materias[codigo][grupoNombre]?.sesiones;
        sesiones.forEach(sesion => {
            const horaInicio = sesion["hora-inicio"];
            const horaFin = sesion["hora-fin"];
            const dia = sesion["dia"];

            const sessioncell = calendarTable.querySelector(`td[data-day='${dia-1}'][data-hour='${horaInicio}']`);
            if (sessioncell && sessioncell.textContent.trim() !== "") {
                alert(`Conflicto de horario detectado: ${codigo} - ${grupoNombre} el día ${dia} a las ${horaInicio}:00.`);
    
                selected_groups.splice(index, 1);
                drawCalendar(selected_groups, materias);
                grupo.remove();
                return; 
            }
            if (sessioncell) {
                const sessionDiv = document.createElement("div");
                sessionDiv.className = "session";
                nombre = codigo
                sessionDiv.textContent = `${codigo} - ${grupoNombre}`;
                sessioncell.appendChild(sessionDiv);
            }
            if (horaFin == horaInicio+4) {
                const nextSessionCell = calendarTable.querySelector(`td[data-day='${dia-1}'][data-hour='${horaInicio+2}']`);
                if (nextSessionCell) {
                    const sessionDiv = document.createElement("div");
                    sessionDiv.className = "session";
                    sessionDiv.textContent = `${codigo} - ${grupoNombre}`;
                    nextSessionCell.appendChild(sessionDiv);
                }
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const classesList = document.getElementById("classes");

    const res = await fetch("materias_simple.json");
    const materias = await res.json();

    Object.entries(materias).forEach(([codigo, grupos]) => {
        const li = document.createElement("li");
        li.className = "list-group-item fw-bold";
        li.textContent = codigo;
        li.style = "width: 100%;";  
        li.style.cursor = "pointer";

        const gruposContainer = document.createElement("ul");
        gruposContainer.className = "list-group mt-2";
        gruposContainer.style.display = "none";

        Object.entries(grupos).forEach(([grupoNombre, info]) => {
            const grupoItem = document.createElement("li");
            const grupoItemDiv = document.createElement("div");
            grupoItemDiv.style = `
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            `;

            const grupoNombreElement = document.createElement("span");
            grupoNombreElement.style = "font-weight: bold;";

            const sesionHorarioElement = document.createElement("span");
            sesionHorarioElement.style = "font-size: 0.9em; color: gray;";

            const calendarTable = document.getElementById("calendar-body");
            grupoItem.className = "list-group-item";

            // Convertir sesiones a texto legible
            const diaNombres = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
            let sesionesTxt = "Sin horario";

            if (info.sesiones && info.sesiones.length > 0) {
                sesionesTxt = info.sesiones.map(s => {
                    const dia = diaNombres[s.dia] || "?";
                    const horaInicio = s["hora-inicio"].toString().padStart(2, "0") + ":00";
                    const horaFin = s["hora-fin"].toString().padStart(2, "0") + ":00";
                    return `${dia} ${horaInicio}-${horaFin}`;
                }).join(" | ");
            }

            grupoNombreElement.textContent = `${grupoNombre} - ${info.profesor}`;
            sesionHorarioElement.textContent = sesionesTxt;

            // Añadir los elementos al grupo
            grupoItemDiv.appendChild(grupoNombreElement);
            grupoItemDiv.appendChild(sesionHorarioElement);
            grupoItem.appendChild(grupoItemDiv);

            grupoItem.addEventListener("click", () => {
                const selectedClassesList = document.getElementById("selected-classes");
                const selectedItem = document.createElement("li");
                selectedItem.className = "list-group-item";
                selectedItem.classList.add(codigo.substring(codigo.indexOf("-") + 1).trim());
                selectedItem.dataset.codigo = codigo;
                selectedItem.textContent = `${grupoNombre} - ${info.profesor}`;
                
                if ([...selectedClassesList.children].some(child => child.classList.contains(codigo.substring(codigo.indexOf("-") + 1).trim()))) {
                    const existingItem = [...selectedClassesList.children].find(child => child.classList.contains(codigo.substring(codigo.indexOf("-") + 1).trim()));
                    selectedClassesList.removeChild(existingItem);
                }
                selectedItem.addEventListener("click", () => {
                    selectedClassesList.removeChild(selectedItem);
                    const selected_groups = Array.from(selectedClassesList.children);
                    drawCalendar(selected_groups, materias);
                });
                selectedClassesList.appendChild(selectedItem);
                const selected_groups = Array.from(selectedClassesList.children);
                drawCalendar(selected_groups, materias);
            });
            gruposContainer.appendChild(grupoItem);
        });

        li.addEventListener("click", () => {
            const visible = gruposContainer.style.display === "block";
            gruposContainer.style.display = visible ? "none" : "block";
        });

        classesList.appendChild(li);
        classesList.appendChild(gruposContainer);

    });

});