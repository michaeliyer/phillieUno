// IndexedDB Setup
const dbRequest = indexedDB.open("phillieUnoDB", 2);

dbRequest.onupgradeneeded = function (event) {
  const db = event.target.result;

  if (!db.objectStoreNames.contains("trips")) {
    const store = db.createObjectStore("trips", { keyPath: "id" });
    store.createIndex("byStartDate", "startDate", { unique: false });
    store.createIndex("byEndDate", "endDate", { unique: false });
  } else {
    const store = event.target.transaction.objectStore("trips");
    if (!store.indexNames.contains("byStartDate")) {
      store.createIndex("byStartDate", "startDate", { unique: false });
    }
    if (!store.indexNames.contains("byEndDate")) {
      store.createIndex("byEndDate", "endDate", { unique: false });
    }
  }
};

dbRequest.onsuccess = function () {
  console.log("IndexedDB version 2 is ready.");
};

dbRequest.onerror = function () {
  console.error("Error opening IndexedDB:", dbRequest.error);
};

// Add Sample Trips (Optional for Testing)
function addSampleTrips() {
  const dbRequest = indexedDB.open("phillieUnoDB", 2);

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("trips", "readwrite");
    const store = transaction.objectStore("trips");

    const sampleTrips = [
      {
        id: 1,
        location: "Amsterdam",
        startDate: "2001-01-01",
        endDate: "2001-01-10",
        notes: "Traveled alone, spent first half sick",
        dailyNotes: {
          "2001-01-01": "Landed in Amsterdam. Feeling unwell.",
          "2001-01-02": "Visited museums. Felt better.",
        },
        photos: [],
      },
      {
        id: 2,
        location: "Paris",
        startDate: "2020-12-10",
        endDate: "2020-12-20",
        notes: "A romantic getaway",
        dailyNotes: {
          "2020-12-11": "Visited the Eiffel Tower.",
        },
        photos: [],
      },
    ];

    sampleTrips.forEach(trip => store.put(trip));
    console.log("Sample trips added.");
  };
}


// Uncomment to initialize the database with sample data
// addSampleTrips();



//  Photo Option Incomplete

document.getElementById("tripInputForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const tripId = parseInt(document.getElementById("tripId").value);
    const location = document.getElementById("location").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const notes = document.getElementById("notes").value;
    const photoFiles = document.getElementById("photoUpload").files;
  
    // Convert photos to Base64
    const photoPromises = Array.from(photoFiles).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          resolve(e.target.result); // Base64 string
        };
        reader.onerror = function () {
          reject("Error reading file");
        };
        reader.readAsDataURL(file);
      });
    });
  
    Promise.all(photoPromises).then(photos => {
      console.log("Photos being saved:", photos); // Debugging log
        
      const newTrip = {
        id: tripId,
        location: location,
        startDate: startDate,
        endDate: endDate,
        notes: notes,
        dailyNotes: {}, // Placeholder for daily notes
        photos: photos, // Base64 encoded photos
      };
  
      const dbRequest = indexedDB.open("phillieUnoDB", 2);
  
      dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("trips", "readwrite");
        const store = transaction.objectStore("trips");
  
        store.put(newTrip);
        alert("Trip added successfully!");
        document.getElementById("tripInputForm").reset();
      };
  
      dbRequest.onerror = function () {
        console.error("Error opening database:", dbRequest.error);
      };
    });
  });




// // Fetch and Display a Trip by ID
document.getElementById("tripForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const tripNumber = parseInt(document.getElementById("tripNumber").value);
  const dbRequest = indexedDB.open("phillieUnoDB", 2);

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("trips", "readonly");
    const store = transaction.objectStore("trips");

    const request = store.get(tripNumber);
    request.onsuccess = function () {
      const trip = request.result;
      if (trip) {
        displayTrip(trip);
      } else {
        alert("Trip not found.");
      }
    };
  };
});

// Display Trip Details
function displayTrip(trip) {
  const detailsContainer = document.getElementById("tripDetails");

  console.log("Photos retrieved for display:", trip.photos);

  const dailyNotes = Object.entries(trip.dailyNotes || {})
    .map(([date, note]) => `<li>${date}: ${note}</li>`)
    .join("");


  // Generate photo thumbnails
  const photos = (trip.photos || []).map(
    (photo, index) => `
      <img 
        src="${photo}" 
        alt="Photo ${index + 1}" 
        style="width: 100px; height: auto; margin-right: 10px; cursor: pointer;" 
        onclick="window.open('${photo}', '_blank')"
      />
    `
  ).join("");




  detailsContainer.innerHTML = `
    <h2>Trip ${trip.id}</h2>
    <p><strong>Location:</strong> ${trip.location}</p>
    <p><strong>Start Date:</strong> ${trip.startDate}</p>
    <p><strong>End Date:</strong> ${trip.endDate}</p>
    <p><strong>Notes:</strong> ${trip.notes}</p>
    <h3>Daily Notes:</h3>
    <ul>${dailyNotes || "<p>No daily notes available.</p>"}</ul>

    <h3>Photos:</h3>
    <div>${photos || "<p>No photos available.</p>"}</div>
  `;
}




//-----------



// Export Trips as JSON
function exportTrips() {
  const dbRequest = indexedDB.open("phillieUnoDB", 2);

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("trips", "readonly");
    const store = transaction.objectStore("trips");

    store.getAll().onsuccess = function (event) {
      const trips = event.target.result;
      const blob = new Blob([JSON.stringify(trips, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "trips.json";
      a.click();
    };
  };
}

// Attach export functionality to a button
document.getElementById("exportTrips").addEventListener("click", exportTrips);


// Display All Trips as an Unordered List
function displayAllTrips() {
    const dbRequest = indexedDB.open("phillieUnoDB", 2);
  
    dbRequest.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("trips", "readonly");
      const store = transaction.objectStore("trips");
  
      // Get all trips
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = function () {
        const trips = getAllRequest.result;
        const tripList = document.getElementById("tripList");
  
        // Clear the list before appending
        tripList.innerHTML = "";
  
        // Generate the ordered list
        trips.forEach(trip => {
          const listItem = document.createElement("li");
          listItem.textContent = `Trip ${trip.id}: ${trip.location}`;
        //   listItem.textContent = `${trip.location}`;
          listItem.style.cursor = "pointer";
  
          // Make each item clickable
          listItem.addEventListener("click", function () {
            displayTrip(trip); // Call your existing function to show trip details
          });
  
          tripList.appendChild(listItem);
        });
      };
  
      getAllRequest.onerror = function () {
        console.error("Error fetching trips:", getAllRequest.error);
      };
    };
  
    dbRequest.onerror = function () {
      console.error("Error opening IndexedDB:", dbRequest.error);
    };
  }
  
  // Call this function to populate the list on page load
  displayAllTrips();