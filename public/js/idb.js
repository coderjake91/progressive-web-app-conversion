//create a variable to hold db connection
let db;
//establish a connection to IndexedDB database called 'budget-tracker' and set it to version 1
const request = indexedDB.open('budget-tracker', 1);

//this event will emit if the database version changes
request.onupgradeneeded = function(event) {
    //save a reference to the database
    const db = event.target.result;
    //create an object store (table) called 'new_user_transaction', set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_user_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    //when db is successfully created with its object store (from onupgradeneeded event above) or simply established a connection, save reference to db in a global variable
    db = event.target.result;

    //check if app is online, if yes - run uploadUserTransaction() function to send all local db data to api
    if(navigator.onLine) {
        uploadUserTransaction();
    }
};

request.onerror = function(event) {
    //log error here
    console.log(event.target.errorCode);
};

//This function will be executed if we attempt to submit a new user transaction and there's no internet connection
function saveRecord(record) {
    //open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_user_transaction'], 'readwrite');

    //access the object store for 'new_user_transaction'
    const userTransactionObjectStore = transaction.objectStore('new_user_transaction');

    //add record to your store with add method
    userTransactionObjectStore.add(record);
}

function uploadUserTransaction() {
    //open a transaction to your db
    const transaction = db.transaction(['new_user_transaction'], 'readwrite');

    //access your object store
    const userTransactionObjectStore = transaction.objectStore('new_user_transaction');

    //get all records from store and set to a variable
    const getAll = userTransactionObjectStore.getAll();

    //upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        //if there was data in indexedDB's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
                //open one more transaction
                const transaction = db.transaction(['new_user_transaction'], 'readwrite');
                //access the new_user_transaction object store
                const userTransactionObjectStore = transaction.objectStore('new_user_transaction');
                //clear all items in your store
                userTransactionObjectStore.clear();

                alert('All saved user transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

//listen for app coming back online
window.addEventListener('online', uploadUserTransaction);