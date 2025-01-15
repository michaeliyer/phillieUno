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

// Save User-Generated Trip
document.getElementById("tripInputForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const trip = {
    id: parseInt(document.getElementById("tripId").value),
    location: document.getElementById("location").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    notes: document.getElementById("notes").value,
    dailyNotes: {}, // Placeholder for now; can add date-specific notes later
    photos: [], // Placeholder for photo functionality
  };

  const dbRequest = indexedDB.open("phillieUnoDB", 2);

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("trips", "readwrite");
    const store = transaction.objectStore("trips");

    store.put(trip);
    alert("Trip saved!");
    document.getElementById("tripInputForm").reset(); // Clear the form
  };
});

// Fetch and Display a Trip by ID
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

  const dailyNotes = Object.entries(trip.dailyNotes || {})
    .map(([date, note]) => `<li>${date}: ${note}</li>`)
    .join("");

  detailsContainer.innerHTML = `
    <h2>Trip ${trip.id}</h2>
    <p><strong>Location:</strong> ${trip.location}</p>
    <p><strong>Start Date:</strong> ${trip.startDate}</p>
    <p><strong>End Date:</strong> ${trip.endDate}</p>
    <p><strong>Notes:</strong> ${trip.notes}</p>
    <h3>Daily Notes:</h3>
    <ul>${dailyNotes || "<p>No daily notes available.</p>"}</ul>
  `;
}

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