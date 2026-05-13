function drawCalendar(selected_groups, materias) {
    for (const cell of document.querySelectorAll("#calendar-body td")) {
        cell.innerHTML = "";
    }
    selected_groups.forEach((grupo,index) => {
        const calendarTable = document.getElementById("calendar-body");
        const codigo = grupo.dataset.codigo;
        const grupoNombre = grupo.textContent.split(" - ")[0];
        const sesiones = materias[codigo][grupoNombre]?.sesiones;
        var message = "";
        sesiones.forEach(sesion => {
            const horaInicio = sesion["hora-inicio"];
            const horaFin = sesion["hora-fin"];
            const dia = sesion["dia"];

            const sessioncell = calendarTable.querySelector(`td[data-day='${dia-1}'][data-hour='${horaInicio}']`);
            if (sessioncell && sessioncell.textContent.trim() !== "") {
                if(message=="") message += `El grupo ${grupoNombre} del código ${codigo} tiene un conflicto de horario con otra materia seleccionada.\n`;
                selected_groups.splice(index, 1);
                drawCalendar(selected_groups, materias);
                grupo.remove();
                return; 
            }
            if (sessioncell) {
                const sessionDiv = document.createElement("div");
                sessionDiv.className = "session";
                sessionDiv.style = "background-color: #555555; padding: 5px; border-radius: 4px;";
                nombre = codigo.split("-")[0].trim();
                sessionDiv.innerHTML = `${nombre}<br>${grupoNombre}`;
                sessioncell.appendChild(sessionDiv);
            }
            if (horaFin == horaInicio+4) {
                const nextSessionCell = calendarTable.querySelector(`td[data-day='${dia-1}'][data-hour='${horaInicio+2}']`);
                if (nextSessionCell) {
                    const sessionDiv = document.createElement("div");
                    sessionDiv.className = "session";
                    sessionDiv.style = "background-color: #555555; padding: 5px; border-radius: 4px;";
                    sessionDiv.textContent = `${codigo} - ${grupoNombre}`;
                    nextSessionCell.appendChild(sessionDiv);
                }
            }
        });
        if (message !== "") {
            alert(message);
        }
    });
}

function loadSavedSchedules(materias) {
    console.log("Cargando horarios guardados...");
    const savedScheduleCookie = document.cookie.split("; ").find(row => row.startsWith("savedSchedule"));
    console.log(savedScheduleCookie);
    if (savedScheduleCookie) {
        const savedScheduleData = JSON.parse(savedScheduleCookie.split("=")[1]);
        console.log(savedScheduleData);
        const periodo = savedScheduleData.periodo;
        const grupos = savedScheduleData.grupos;
        const selectedClassesList = document.getElementById("selected-classes");
        selectedClassesList.replaceChildren();
        grupos.forEach(grupo => {
            const selectedItem = document.createElement("li");
            selectedItem.className = "list-group-item";
            selectedItem.classList.add(grupo.codigo.substring(grupo.codigo.indexOf("-") + 1).trim());
            selectedItem.dataset.codigo = grupo.codigo;
            selectedItem.textContent = `${grupo.grupo}`;
            selectedItem.addEventListener("click", () => {
                selectedClassesList.removeChild(selectedItem);
                const selected_groups = Array.from(selectedClassesList.children);
                drawCalendar(selected_groups, materias);
            });
            selectedClassesList.appendChild(selectedItem);
        });
        drawCalendar(Array.from(selectedClassesList.children), materias);
    } else {
        alert("No se encontraron horarios guardados.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    var horariosGuardados = [];
    if (document.cookie) {
        for (const cookie of document.cookie.split(";")) {
            const scheduleData = JSON.parse(cookie.split("=")[1]);
            horariosGuardados.push(scheduleData);
        }
        for (const horario of horariosGuardados) {
            const saveScheduleDiv = document.createElement("div");
            saveScheduleDiv.classList = "d-flex flex-row align-items-start justify-content-center";
            const savedScheduleItem = document.createElement("li");
            savedScheduleItem.className = "list-group-item w-75";
            savedScheduleItem.textContent = horario.nombre;
            savedScheduleItem.addEventListener("click", () => {
                loadSavedSchedules(materias);
            });
            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-sm btn-danger ms-2";
            deleteButton.textContent = "Eliminar";
            deleteButton.addEventListener("click", (e) => {
                e.stopPropagation();
                document.cookie = `savedSchedule=${JSON.stringify(horario)}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                saveScheduleDiv.remove();
            });
            saveScheduleDiv.appendChild(savedScheduleItem);
            saveScheduleDiv.appendChild(deleteButton);
            document.getElementById("saved-schedules").appendChild(saveScheduleDiv);
        }
    }

    var periodoSeleccionado = "Verano"; 
    const classesList = document.getElementById("classes");
    const selectedClassesList = document.getElementById("selected-classes");

    const res = await fetch("materias_simple.json");
    const materias = await res.json();

    const veranoContainer = document.createElement("li");
    veranoContainer.className = "list-group mt-2 mb-2";
    veranoContainer.textContent = "Verano";
    veranoContainer.style.fontWeight = "bold";
    veranoContainer.style.backgroundColor = "#292929";
    veranoContainer.style.padding = "10px";
    classesList.appendChild(veranoContainer);
    const veranoMaterias = document.createElement("ul");
    veranoMaterias.className = "list-group mt-2";
    veranoMaterias.style.backgroundColor = "#292929";
    veranoMaterias.style.padding = "10px";
    veranoContainer.appendChild(veranoMaterias);

    veranoContainer.addEventListener("click", () => {
        if(periodoSeleccionado === "Verano") {
            return;
        }
        periodoSeleccionado = "Verano";
        veranoMaterias.style.display = veranoMaterias.style.display === "block" ? "none" : "block";
        otonoMaterias.style.display = "none";
        selectedClassesList.replaceChildren();
        drawCalendar([], materias);
    });

    const otonoContainer = document.createElement("li");
    otonoContainer.className = "list-group mt-2 mb-2";
    otonoContainer.textContent = "Otoño";
    otonoContainer.style.fontWeight = "bold";
    otonoContainer.style.backgroundColor = "#292929";
    otonoContainer.style.padding = "10px";
    classesList.appendChild(otonoContainer);
    const otonoMaterias = document.createElement("ul");
    otonoMaterias.style.display = "none";
    otonoMaterias.className = "list-group mt-2";
    otonoMaterias.style.backgroundColor = "#292929";
    otonoMaterias.style.padding = "10px";
    otonoContainer.appendChild(otonoMaterias);  
    otonoContainer.addEventListener("click", () => {
        if(periodoSeleccionado === "Otoño") {
            return;
        }
        periodoSeleccionado = "Otoño";
        otonoMaterias.style.display = otonoMaterias.style.display === "block" ? "none" : "block";
        veranoMaterias.style.display = "none";
        selectedClassesList.replaceChildren();
        drawCalendar([], materias);
    });

    Object.entries(materias).forEach(([codigo, grupos]) => {
        const li = document.createElement("li");
        li.className = "list-group-item fw-bold";
        li.textContent = codigo;
        li.style = "width: 100%;";  
        li.style.cursor = "pointer";


        const gruposContainer = document.createElement("ul");
        gruposContainer.className = "list-group mt-2";
        gruposContainer.style.display = "none";
        gruposContainer.style.maxHeight = "300px";
        gruposContainer.style.overflowY = "auto";
        gruposContainer.style.marginBottom = "10px";
        gruposContainer.style.backgroundColor = "#292929";
        gruposContainer.style.padding = "10px";
        

        Object.entries(grupos).forEach(([grupoNombre, info]) => {
            const grupoItem = document.createElement("li");
            const grupoItemDiv = document.createElement("div");
            grupoItemDiv.style = `
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                cursor: pointer;
            `;

            const grupoNombreElement = document.createElement("span");
            grupoNombreElement.style = "font-weight: bold;";

            const sesionHorarioElement = document.createElement("span");
            sesionHorarioElement.style = "font-size: 0.9em; color: gray;";

            const calendarTable = document.getElementById("calendar-body");
            grupoItem.className = "list-group-item";

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

            grupoItemDiv.appendChild(grupoNombreElement);
            grupoItemDiv.appendChild(sesionHorarioElement);
            grupoItem.appendChild(grupoItemDiv);

            grupoItem.addEventListener("click", () => {
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
                    drawCalendar(selected_groups, materias);
                });
                selectedClassesList.appendChild(selectedItem);
                const selected_groups = Array.from(selectedClassesList.children);
                drawCalendar(selected_groups, materias);
            });
            gruposContainer.appendChild(grupoItem);
            gruposContainer.appendChild(grupoItem);
        });

        li.addEventListener("click", () => {
            const visible = gruposContainer.style.display === "block";
            gruposContainer.style.display = visible ? "none" : "block";
            if (!visible) {
                li.style="background-color: #666666 !important;box-shadow: 4px 4px 10px #000000;"
            } else {
                li.style="background-color: #444444 !important;box-shadow: 2px 2px 5px #000000;"
            }
        });

        if (codigo.startsWith("V")) {
            veranoMaterias.appendChild(li);
            veranoMaterias.appendChild(gruposContainer);
        } else {
            otonoMaterias.appendChild(li);
            otonoMaterias.appendChild(gruposContainer);
        }

    });

    //-----------------------------------------------------------------------------------------------------------
    // Guardar horario
    //-----------------------------------------------------------------------------------------------------------

    const saveScheduleButton = document.getElementById("save-schedule");
    const savedSchedulesList = document.getElementById("saved-schedules");
    saveScheduleButton.addEventListener("click", () => {
        const selected_groups = Array.from(selectedClassesList.children).map(li => ({
            codigo: li.dataset.codigo,
            grupo: li.textContent.split(" - ")[0].trim()
        }));
        if (selected_groups.length === 0) {
            alert("No hay grupos seleccionados para guardar.");
            return;
        }
        let scheduleName = prompt("Nombre del horario:");
        const scheduleData = {
            nombre: scheduleName || "Horario guardado",
            periodo: periodoSeleccionado,
            grupos: selected_groups
        };


        document.cookie = `savedSchedule${scheduleData.nombre}=${JSON.stringify(scheduleData)}; path=/; max-age=31536000`; // Guarda por 1 año
        const savedScheduleDiv = document.createElement("div");
        savedScheduleDiv.classList = "d-flex flex-row align-items-start justify-content-center";
        const savedScheduleItem = document.createElement("li");
        savedScheduleItem.className = "list-group-item w-75";
        savedScheduleItem.textContent = scheduleName || "Horario guardado";
        savedScheduleItem.addEventListener("click", () => {
            loadSavedSchedules(materias);
        });
        savedScheduleDiv.appendChild(savedScheduleItem);
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-sm btn-danger ms-2";
        deleteButton.textContent = "Eliminar";
        deleteButton.addEventListener("click", () => {
            document.cookie = `savedSchedule${scheduleData.nombre}=; path=/; max-age=0`;
            savedScheduleDiv.remove();
        });
        savedScheduleDiv.appendChild(deleteButton);
        savedSchedulesList.appendChild(savedScheduleDiv);
    });


});