let rowCount = 0;
let isEditMode = true;

function addRow() {
  rowCount++;
  const tbody = document.getElementById('tableBody');
  const row = document.createElement('tr');

  row.innerHTML = `
    <td data-label="№" id="id">${rowCount}</td>
    <td data-label="Местоположение"><textarea id="location" rows="2" placeholder="Укажите местоположение" required></textarea></td>
    <td data-label="Описание"><textarea id="defect_description" rows="2" placeholder="Опишите дефект" required></textarea></td>
    <td data-label="Категория по ГОСТ">
      <select id="defect_category" required>
        <option value="">Выберите категорию</option>
        <option value="устранимый">устранимый</option>
        <option value="критический">критический</option>
      </select>
    </td>
    <td data-label="Метод устранения"><textarea id="elimination_method" rows="2" placeholder="Предложите метод устранения"></textarea></td>
    <td data-label="Фото">
      <input id="photo" type="file" accept="image/*" onchange="previewImage(event, this)">
      <div class="preview-container"></div>
    </td>
    <td data-label="Ссылка">
      <div class="link-container">
        <textarea id="tag_link" rows="1" placeholder="Введите ссылку" oninput="toggleIcon(this)"></textarea>
        <img src="https://img.icons8.com/ios-filled/24/external-link.png" class="link-icon" alt="Ссылка">
      </div>
    </td>
    <td data-label="Действие"><button type="button" class="remove-btn" onclick="removeRow(this)">🗑 Удалить</button></td>
  `;
  tbody.appendChild(row);

  // Добавляем класс для строки с фото, если нужно
  const fileInput = row.querySelector('input[type="file"]');
  fileInput.addEventListener('change', function(e) {
    previewImage(e, this);
  });
}

function removeRow(button) {
  if (confirm('Вы уверены, что хотите удалить эту строку?')) {
    const row = button.closest('tr');
    row.remove();
    updateRowNumbers();
  }
}

function updateRowNumbers() {
  const rows = document.querySelectorAll('#tableBody tr');
  rowCount = 0;
  rows.forEach((row, index) => {
    rowCount++;
    row.cells[0].textContent = rowCount;
  });
}

function previewImage(event, input) {
  const container = input.nextElementSibling;
  const file = event.target.files[0];
  const row = input.closest('tr');
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      container.innerHTML = `
        <img src="${e.target.result}" class="preview-img">
        <button type="button" class="remove-btn" onclick="removeImage(this)" style="width: 100%; margin-top: 8px;">🗑 Удалить фото</button>
      `;
      row.classList.add('has-photo');
      
      // Адаптируем высоту textarea в этой строке
      const textareas = row.querySelectorAll('textarea');
      textareas.forEach(ta => {
        ta.style.height = '100px';
      });
    };
    reader.readAsDataURL(file);
  }
}

function removeImage(button) {
  const container = button.parentElement;
  const fileInput = container.previousElementSibling;
  const row = container.closest('tr');
  
  fileInput.value = "";
  container.innerHTML = "";
  row.classList.remove('has-photo');
  
  // Возвращаем стандартную высоту textarea
  const textareas = row.querySelectorAll('textarea');
  textareas.forEach(ta => {
    ta.style.height = '';
  });
}

function toggleIcon(textarea) {
  const icon = textarea.nextElementSibling;
  icon.style.display = textarea.value.trim() ? "inline-block" : "none";
}

// Функции редактора текста
function format(command) {
  document.execCommand(command, false, null);
  document.getElementById('text-editor').focus();
}

function insertLink() {
  const url = prompt("Введите URL ссылки:", "https://");
  if (url) {
    document.execCommand("createLink", false, url);
  }
}

function toggleEditMode() {
  const editor = document.getElementById('text-editor');
  const toggleBtn = document.getElementById('toggleBtn');
  
  isEditMode = !isEditMode;
  editor.contentEditable = isEditMode;
  toggleBtn.textContent = isEditMode ? "🔒 Режим просмотра" : "✏️ Режим редактирования";
}

function setFontSize(size) {
  if (size) document.execCommand('fontSize', false, size);
}

function setFontFamily(font) {
  if (font) document.execCommand('fontName', false, font);
}

function alignText(alignment) {
  document.execCommand('justify' + alignment);
}

// Sidebar toggle
const viewSwitcher = document.getElementById('viewSwitcher');
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebarToggle');
const mainContent = document.getElementById('mainContent');
const SIDEBAR_WIDTH = 250; // in pixels


sidebarToggleBtn.addEventListener('click', () => {
  const sidebarIsClosed = sidebar.style.transform === 'translateX(-100%)';
  
  if (sidebarIsClosed) {
    sidebar.style.transform = 'translateX(0)';
    if (editorContainer.style.display !== 'none') {
      editorContainer.style.marginLeft = SIDEBAR_WIDTH + 'px';
    }
    if (defectFormContainer.style.display !== 'none') {
      defectFormContainer.style.marginLeft = SIDEBAR_WIDTH + 'px';
    }
    viewSwitcher.style.marginLeft = SIDEBAR_WIDTH + 'px'; // ✅ move the buttons too
  } else {
    sidebar.style.transform = 'translateX(-100%)';
    editorContainer.style.marginLeft = '0';
    defectFormContainer.style.marginLeft = '0';
    viewSwitcher.style.marginLeft = '0'; // ✅ reset buttons position
  }
});



// Section management
const sectionList = document.getElementById('sectionList');
const addSectionBtn = document.getElementById('addSectionBtn');
const editor = document.getElementById('text-editor');

let sections = [];
let activeSectionId = null;

function initializeDefaultSection() {
  // Only add default section if none exist
  if (sections.length === 0) {
    const defaultSection = {
      id: generateId(),
      name: 'Раздел 1',
      content: '',
    };
    sections.push(defaultSection);
    activeSectionId = defaultSection.id;
  }

  renderSectionList();
  loadActiveSection();
}

function generateId() {
  return 'section-' + Math.random().toString(36).substr(2, 9);
}

function loadActiveSection() {
  const section = sections.find(s => s.id === activeSectionId);
  if (section) {
    editor.innerHTML = section.content;
  }
}

function generateId() {
  return 'sec-' + Math.random().toString(36).substr(2, 9);
}

function renderSectionList() {
  sectionList.innerHTML = '';
  sections.forEach((section, index) => {
    const li = document.createElement('li');
    li.style.cssText = 'background:#333; margin-bottom:8px; padding:8px 12px; border-radius:6px; cursor:pointer; user-select:none; display:flex; align-items:center; justify-content:space-between; transition:background 0.2s; white-space:nowrap; overflow:hidden; color:#fff;';

    if (section.id === activeSectionId) {
      li.style.background = '#00aa55';
      li.style.fontWeight = 'bold';
    }

    const nameSpan = document.createElement('span');
    nameSpan.textContent = section.name;
    nameSpan.style.flexGrow = '1';
    nameSpan.style.overflow = 'hidden';
    nameSpan.style.textOverflow = 'ellipsis';
    nameSpan.style.whiteSpace = 'nowrap';
    nameSpan.style.cursor = 'pointer';
    nameSpan.title = section.name;
    nameSpan.onclick = () => switchSection(section.id);

    // Rename button
    const renameBtn = document.createElement('button');
    renameBtn.textContent = '✏️';
    renameBtn.title = 'Переименовать';
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      const newName = prompt('Введите новое имя раздела:', section.name);
      if (newName && newName.trim()) {
        section.name = newName.trim();
        renderSectionList();
      }
    };

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Удалить';
    deleteBtn.style.color = '#ff4444';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm(`Удалить раздел "${section.name}"?`)) {
        deleteSection(section.id);
      }
    };

    // Up button
    const upBtn = document.createElement('button');
    upBtn.textContent = '🔼';
    upBtn.title = 'Переместить вверх';
    upBtn.disabled = index === 0;
    upBtn.onclick = (e) => {
      e.stopPropagation();
      moveSection(index, -1);
    };

    // Down button
    const downBtn = document.createElement('button');
    downBtn.textContent = '🔽';
    downBtn.title = 'Переместить вниз';
    downBtn.disabled = index === sections.length - 1;
    downBtn.onclick = (e) => {
      e.stopPropagation();
      moveSection(index, 1);
    };

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '4px';
    btnGroup.append(renameBtn, deleteBtn, upBtn, downBtn);

    li.append(nameSpan, btnGroup);
    sectionList.appendChild(li);
  });
}

function moveSection(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= sections.length) return;

  const temp = sections[index];
  sections[index] = sections[newIndex];
  sections[newIndex] = temp;

  renderSectionList();
}



// Delete section function
function deleteSection(id) {
  const index = sections.findIndex(s => s.id === id);
  if (index === -1) return;

  sections.splice(index, 1);

  // If deleted section was active, switch to another section or create new if none left
  if (activeSectionId === id) {
    if (sections.length > 0) {
      activeSectionId = sections[0].id;
      editor.innerHTML = sections[0].content;
    } else {
      // No sections left, create new default one
      initSections();
      return;
    }
  }
  renderSectionList();
  editor.focus();
}


function switchSection(id) {
  if (activeSectionId === id) return;

  if (activeSectionId) {
    const currentSection = sections.find(s => s.id === activeSectionId);
    if (currentSection) {
      currentSection.content = editor.innerHTML;
    }
  }

  activeSectionId = id;
  const newSection = sections.find(s => s.id === id);
  editor.innerHTML = newSection ? newSection.content : '';
  renderSectionList();
  editor.focus();
}

function addSection() {
  if (activeSectionId) {
    const currentSection = sections.find(s => s.id === activeSectionId);
    if (currentSection) {
      currentSection.content = editor.innerHTML;
    }
  }

  let name = prompt('Введите имя нового раздела:', `Раздел ${sections.length + 1}`);
  if (!name) return;

  const newSection = {
    id: generateId(),
    name: name.trim(),
    content: ''
  };
  sections.push(newSection);
  activeSectionId = newSection.id;

  renderSectionList();
  editor.innerHTML = '';
  editor.focus();
}

addSectionBtn.addEventListener('click', addSection);

editor.addEventListener('input', () => {
  if (!activeSectionId) return;
  const currentSection = sections.find(s => s.id === activeSectionId);
  if (currentSection) {
    currentSection.content = editor.innerHTML;
  }
});

function initSections() {
  const defaultSection = {
    id: generateId(),
    name: 'Раздел 1',
    content: 'Начните вводить содержание отчёта здесь...'
  };
  sections.push(defaultSection);
  activeSectionId = defaultSection.id;
  renderSectionList();
  editor.innerHTML = defaultSection.content;
  editor.focus();
}

window.addEventListener('load', () => {
  // Hide sidebar initially (optional)
  sidebar.style.transform = 'translateX(-100%)';
  mainContent.style.marginLeft = '0';

  initSections();
});


const editorContainer = document.getElementById('editorContainer');
const defectFormContainer = document.getElementById('defectFormContainer');

document.getElementById('btnEditor').addEventListener('click', () => {
  editorContainer.style.display = 'block';
  defectFormContainer.style.display = 'none';
  setActiveButton(btnEditor);
});

document.getElementById('btnDefectForm').addEventListener('click', () => {
  editorContainer.style.display = 'none';
  defectFormContainer.style.display = 'block';
  setActiveButton(btnDefectForm);
});


function setActiveButton(activeBtn) {
  [btnEditor, btnDefectForm].forEach(btn => {
    btn.style.backgroundColor = btn === activeBtn ? '#00aa55' : '';
    btn.style.color = btn === activeBtn ? 'white' : '';
  });
}

const btnEditor = document.getElementById('btnEditor');
const btnDefectForm = document.getElementById('btnDefectForm');

btnEditor.addEventListener('click', () => {
  editorContainer.style.display = 'block';
  defectFormContainer.style.display = 'none';
  setActiveButton(btnEditor);

  // Adjust margins based on sidebar state
  if (sidebar.style.transform === 'translateX(0px)' || sidebar.style.transform === '') {
    editorContainer.style.marginLeft = SIDEBAR_WIDTH + 'px';
    viewSwitcher.style.marginLeft = SIDEBAR_WIDTH + 'px';
  } else {
    editorContainer.style.marginLeft = '0';
    viewSwitcher.style.marginLeft = '0';
  }
});

btnDefectForm.addEventListener('click', () => {
  editorContainer.style.display = 'none';
  defectFormContainer.style.display = 'block';
  setActiveButton(btnDefectForm);

  // Adjust margins based on sidebar state
  if (sidebar.style.transform === 'translateX(0px)' || sidebar.style.transform === '') {
    defectFormContainer.style.marginLeft = SIDEBAR_WIDTH + 'px';
    viewSwitcher.style.marginLeft = SIDEBAR_WIDTH + 'px';
  } else {
    defectFormContainer.style.marginLeft = '0';
    viewSwitcher.style.marginLeft = '0';
  }
});

// Initialize active button on load:
window.addEventListener('load', () => {
  setActiveButton(btnEditor);
});

document.getElementById('savePdfBtn').addEventListener('click', async () => {
const { jsPDF } = window.jspdf;
const pdf = new jsPDF("p", "pt", "a4");
const margin = 40;
const pageWidth = pdf.internal.pageSize.getWidth();
const usableWidth = pageWidth - margin * 2;

// Render HTML element to image for PDF
async function renderElementToPdfContent(element) {
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = usableWidth;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  return { imgData, pdfWidth, pdfHeight };
}

// Save each section as a new page
for (let i = 0; i < sections.length; i++) {
  const tempDiv = document.createElement('div');
  tempDiv.style.padding = "20px";
  tempDiv.style.background = "white";
  tempDiv.style.color = "black";
  tempDiv.style.fontSize = "14px";
  tempDiv.style.lineHeight = "1.6";
  tempDiv.style.width = "800px";
  tempDiv.innerHTML = `<h2>${sections[i].name}</h2>` + sections[i].content;

  document.body.appendChild(tempDiv);
  if (i !== 0) pdf.addPage();

  const { imgData, pdfWidth, pdfHeight } = await renderElementToPdfContent(tempDiv);
  pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);
  document.body.removeChild(tempDiv);
}

// Add defect form table on a new page
pdf.addPage();

const originalForm = document.getElementById("defectFormContainer");
const defectFormClone = originalForm.cloneNode(true);

// COPY current values into the clone
const originalSelects = originalForm.querySelectorAll("select");
const clonedSelects = defectFormClone.querySelectorAll("select");

originalSelects.forEach((origSel, i) => {
  clonedSelects[i].value = origSel.value;
});


// Prepare clean white theme
defectFormClone.style.background = "white";
defectFormClone.style.color = "black";
defectFormClone.style.padding = "20px";
defectFormClone.style.width = "1000px";
defectFormClone.style.boxSizing = "border-box";

// Remove all buttons (e.g. "Добавить строку")
defectFormClone.querySelectorAll("button").forEach(btn => btn.remove());

// Replace textareas, inputs, selects with plain text
// Replace textareas, inputs, selects with plain text
const inputs = defectFormClone.querySelectorAll("textarea, input, select");
inputs.forEach(input => {
const div = document.createElement("div");

if (input.tagName === "SELECT") {
// FIX: extract selectedIndex safely
const selectedIndex = input.selectedIndex;
if (selectedIndex >= 0) {
  const selectedOption = input.options[selectedIndex];
  div.textContent = selectedOption?.textContent || "—";
} else {
  div.textContent = "—";
}
} else if (input.type === "file") {
// Skip file inputs (already handled elsewhere)
return;
} else {
div.textContent = input.value?.trim() || input.placeholder || "—";
}

div.style.color = "black";
div.style.padding = "6px 0";
input.replaceWith(div);
});



// Format table
const table = defectFormClone.querySelector("table");
if (table) {
  table.style.background = "white";
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";

  const cells = table.querySelectorAll("th, td");
  cells.forEach(cell => {
  cell.style.background = "white";
  cell.style.color = "black";
  cell.style.border = "1px solid black";
  cell.style.padding = "8px";
});
}

// Remove "Действие" column from header
const headerRow = defectFormClone.querySelector("thead tr");
if (headerRow) {
  const ths = headerRow.querySelectorAll("th");
  if (ths.length > 0 && ths[ths.length - 1].textContent.trim() === "Действие") {
    ths[ths.length - 1].remove();
  }
}

// Remove "Действие" column from each row
const rows = defectFormClone.querySelectorAll("tbody tr");
rows.forEach(row => {
const cells = row.querySelectorAll("td");
if (cells.length > 0) {
// Remove last column (Действие)
cells[cells.length - 1].remove();

// Convert link column (second last) to actual <a>
const linkTd = cells[6]; // this is the 7th column (index starts at 0)
if (linkTd) {
  const linkText = linkTd.textContent.trim();
  if (linkText && linkText.startsWith("http")) {
    linkTd.innerHTML = `<a href="${linkText}" style="color:blue; text-decoration:underline;" target="_blank">${linkText}</a>`;
  }
}


// Show only the photo (6th column, index 5)
const photoTd = cells[5];
if (photoTd) {
  const img = photoTd.querySelector("img.preview-img");
  if (img) {
    photoTd.innerHTML = "";
    photoTd.appendChild(img.cloneNode(true));
  } else {
    photoTd.innerHTML = "";
  }
}
}
});

document.body.appendChild(defectFormClone);

// Collect all real links (to make clickable in PDF)
const pdfLinks = defectFormClone.querySelectorAll("a[href]");
const linkRects = [];

pdfLinks.forEach(a => {
const rect = a.getBoundingClientRect();
const bounds = {
href: a.href,
top: rect.top,
left: rect.left,
width: rect.width,
height: rect.height
};
linkRects.push(bounds);
});



const { imgData, pdfWidth, pdfHeight } = await renderElementToPdfContent(defectFormClone);
pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);

// Add clickable link overlays to the PDF
linkRects.forEach(link => {
const scale = 2; // html2canvas scale
const x = margin + (link.left - defectFormClone.getBoundingClientRect().left) * scale;
const y = margin + (link.top - defectFormClone.getBoundingClientRect().top) * scale;
const w = link.width * scale;
const h = link.height * scale;

pdf.link(x, y, w, h, { url: link.href });
});

document.body.removeChild(defectFormClone);



pdf.save("отчёт.pdf");
});



// Инициализация
window.onload = function() {
  addRow();
  initializeDefaultSection();
  document.getElementById('text-editor').focus();
};


async function saveTableData() {
  const rows = [];
  const tableRows = document.querySelectorAll('#tableBody tr');
  
  for (const row of tableRows) {
      const photoInput = row.querySelector('#photo');
      let photoBase64 = null;
      
      if (photoInput.files[0]) {
          photoBase64 = await readFileAsBase64(photoInput.files[0]);
      }
      
      const rowData = {
          location: row.querySelector('#location').value,
          defect_description: row.querySelector('#defect_description').value,
          defect_category: row.querySelector('#defect_category').value,
          elimination_method: row.querySelector('#elimination_method').value,
          photo: photoBase64,
          tag_link: row.querySelector('#tag_link').value || null
      };
      rows.push(rowData);
  }
  try {
      const response = await fetch('/save-table-data/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rows)
      });

      const result = await response.json();
      if (response.ok) {
          alert('Данные успешно сохранены!');
      } else {
          alert('Ошибка при сохранении: ' + result.detail);
      }
  } catch (error) {
      alert('Ошибка: ' + error);
  }
}

// Вспомогательная функция для конвертации файла в base64
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // Убираем префикс "data:image/..."
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
}
