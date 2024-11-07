import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, update  } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://lab3-web-note-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const ListInDB = {
    first: ref(database, "first"),
    second: ref(database, "second"),
    less: ref(database, "less")
}

const openPriorityFirstEl = document.getElementById("openPriorityFirst");
const openPrioritySecondEl = document.getElementById("openPrioritySecond");
const openPriorityLessEl = document.getElementById("openPriorityLess");
const goBackEls = document.querySelectorAll(".back-btn");

const inputFields = {
    first: document.getElementById("input-field1"),
    second: document.getElementById("input-field2"),
    less: document.getElementById("input-field3"),
};

const addButtons = {
    first: document.getElementById("add-button1"),
    second: document.getElementById("add-button2"),
    less: document.getElementById("add-button3"),
};

const notesLists = {
    first: document.getElementById("Notes-list1"),
    second: document.getElementById("Notes-list2"),
    less: document.getElementById("Notes-list3"),
};

function togglePageVisibility(showPageId) {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById(showPageId).style.display = 'block';
}

function returnToMainPage() {
    document.getElementById('main-page').style.display = 'flex';
    document.getElementById('task-page1').style.display = 'none';
    document.getElementById('task-page2').style.display = 'none';
    document.getElementById('task-page3').style.display = 'none';
}

openPriorityFirstEl.addEventListener("click", function () {
    togglePageVisibility('task-page1');

});
openPrioritySecondEl.addEventListener("click", function () {
    togglePageVisibility('task-page2');

});
openPriorityLessEl.addEventListener("click", function () {
    togglePageVisibility('task-page3');
    
});

goBackEls.forEach(button => {
    button.addEventListener("click", returnToMainPage);
});

function createTaskItem(taskText, taskID, priority, completed, dueDate) {
    const taskglobal = document.createElement('div')
    taskglobal.className ='div-taskglobal'

    const taskItem = document.createElement('li');
    taskItem.className ='task-item '
    taskItem.style.backgroundColor = "EEF0F4";
    taskItem.innerHTML = `<span>${taskText}</span>`;

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = dueDate; 
    dateInput.className = 'deadline-input';

    
    dateInput.addEventListener("change", function() {
        event.stopPropagation();
        
        const newDeadline = dateInput.value; 
        const taskRef = ref(database, `${priority}/${taskID}`);
        update(taskRef, { dueDate: newDeadline });
    });

    taskItem.style.backgroundColor = completed ?  "#18ceb6" : "#EEF0F4" ;
    taskItem.addEventListener("click", function(){
        const taskRef = ref(database, `${priority}/${taskID}`);
        if (completed){
            update(taskRef, {completed: false});
        } else {
            update(taskRef, {completed:  true});
        }
        
    })

    const deleteButton = document.createElement('button');
    deleteButton.className = "task-delete-btn";
    deleteButton.textContent = "❌";
    
    deleteButton.addEventListener("click", function() {
        event.stopPropagation();
        const exactLocationOfItemInDB = ref(database, `${priority}/${taskID}`)
        remove(exactLocationOfItemInDB)
    });

    taskItem.appendChild(deleteButton);
    taskglobal.appendChild(dateInput);
    taskglobal.appendChild(taskItem);
    
    return taskglobal;
}


function addTask(priority) {
    const taskText = inputFields[priority].value;

     const today = new Date();
     const deadline = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];

    if (taskText) {
        inputFields[priority].value = '';
        push(ListInDB[priority], {
            text: taskText,
            completed: false,
            dueDate: deadline
        });
    }
}

function updateNotesList(priority, snapshot) {
    const notesListEl = notesLists[priority];
    clearNotesListEl(notesListEl); 

    if (snapshot.exists()){
        const itemsArray = Object.entries(snapshot.val())
        console.log(itemsArray);

        if (itemsArray.length === 0) {
            return; 
        }

        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i];
            let currentItemID = currentItem[0]; 
            let currentItemValue = currentItem[1].text; 
            let completed = currentItem[1].completed || false;
            let dueDate = currentItem[1].dueDate

            const taskItem = createTaskItem(currentItemValue, currentItemID, priority, completed, dueDate);
            notesListEl.appendChild(taskItem); 
        }
    } 
}

function clearNotesListEl(notesListEl) {
    notesListEl.innerHTML = ''; 
}

Object.keys(addButtons).forEach(priority => {
    addButtons[priority].addEventListener("click", () => addTask(priority));
});

Object.keys(ListInDB).forEach(priority => {
    onValue(ListInDB[priority], (snapshot) => {
        updateNotesList(priority, snapshot);
    });
});

