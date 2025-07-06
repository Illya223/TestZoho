async function fetchNbuRate() {
	try {
	  const response = await fetch("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json");
	  const data = await response.json();
	   console.log(data);
	  return parseFloat(data[0].rate);
	 
	} catch (error) {
	  console.error("Failed to fetch NBU rate:", error);
	  return null;
	}
  }


function initializeWidget()
{
	console.log("Initializing widget...");
		
	ZOHO.embeddedApp.on("PageLoad", async function(data) {

		console.log("PageLoad triggered with data:", data);
		
		try {
		  if (!data || !data.Entity || !data.EntityId) {
			console.warn("Invalid PageLoad data:", data);
			return;
		  }
	
		  const recordId = data.EntityId;
		  const module = data.Entity;
		  
		  const recordResponse = await ZOHO.CRM.API.getRecord({ Entity:  module, RecordID: recordId });
		  const record = recordResponse.data[0];
	
		  
		  const ugodaRate = parseFloat(record.field); // курс в угоді
		  document.getElementById("ugodiRate").value = ugodaRate;
	
		 
		  const nbuRate = await fetchNbuRate(); //поточний курс
		  console.log(nbuRate)
		  document.getElementById("nbuRate").value = nbuRate;
	
		  
		  const growth = ((nbuRate - ugodaRate) / ugodaRate) * 100; // різниця у відсотках 
		  const roundedGrowth = Math.round(growth / 10) * 10;
		  document.getElementById("growth").value = `${roundedGrowth}%`;
	
		  
		  if (roundedGrowth >= 5) {
			document.getElementById("updateCurrencyBtn").style.display = "block";
		  }
// оновлення поля при натисканні на кнопку 
		  document.getElementById("updateCurrencyBtn").onclick = async () => { 
			const updatePayload = {
			  id: data.EntityId,
			  Currency_Rate: nbuRate 
			};
  
			ZOHO.CRM.API.updateRecord({ Entity: module, APIData: updatePayload })
			  .then((response) => {
				if (response.data && response.data[0].code === "SUCCESS") {
				  alert("Currency Rate updated to NBU rate: " + nbuRate);
				} else {
				  alert("Failed to update Currency Rate");
				  console.error(response);
				}
			  });
		  };
	
		} catch (error) {
		  console.error("Error in initializeWidget:", error);
		}
	  });
	
	
}

