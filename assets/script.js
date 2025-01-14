const dbRequest = indexedDB.open("phillieUnoDB", 1);

dbRequest.onupgradeneeded = function (event) {
  const db = event.target.result;
  if (!db.objectStoreNames.contains("trips")) {
    const store = db.createObjectStore("trips", { keyPath: "id" });
    store.createIndex("byDate", "date", { unique: false });
  }
};

dbRequest.onsuccess = function () {
  console.log("IndexedDB is ready.");
};

dbRequest.onerror = function () {
  console.error("Error opening IndexedDB.");
};


function addSampleTrips() {
    const dbRequest = indexedDB.open("phillieUnoDB", 1);
  
    dbRequest.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("trips", "readwrite");
      const store = transaction.objectStore("trips");
  
      // Add sample trips
      const sampleTrips = [
        {
          id: 1,
          location: "Amsterdam",
          date: "01-01-2001",
          notes: "Traveled alone, spent first half sick",
          photos: [],
        },
        {
          id: 2,
          location: "Paris",
          date: "12-12-2020",
          notes: "A romantic getaway",
          photos: [],
        },
      ];
  
      sampleTrips.forEach(trip => store.put(trip));
      console.log("Sample trips added.");
    };
  }
  
  // Call the function to add sample trips (only once)
  addSampleTrips();


  document.getElementById("tripForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form submission
  
    const tripNumber = parseInt(document.getElementById("tripNumber").value);
    const dbRequest = indexedDB.open("phillieUnoDB", 1);
  
    dbRequest.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("trips", "readonly");
      const store = transaction.objectStore("trips");
  
      const request = store.get(tripNumber);
      request.onsuccess = function () {
        const trip = request.result;
        if (trip) {
          displayTrip(trip); // Call a function to display trip details
        } else {
          alert("Trip not found.");
        }
      };
    };
  });


  function displayTrip(trip) {
    const detailsContainer = document.getElementById("tripDetails");
  
    // Add trip details dynamically
    detailsContainer.innerHTML = `
      <h2>Trip ${trip.id}</h2>
      <p><strong>Location:</strong> ${trip.location}</p>
      <p><strong>Date:</strong> ${trip.date}</p>
      <p><strong>Notes:</strong> ${trip.notes}</p>
    `;
  }
