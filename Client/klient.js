
let dane;
let sciezkaDoPliku;
let daneZPliku;
const wyborPliku = document.querySelector('input[type="text"]')
const reader = new FileReader();
const parser = new DOMParser();
let mymap = L.map('mapid').setView([51.505, -0.09], 4);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { noWrap: true });
tiles.addTo(mymap);
let sciezkiNaMapie = L.featureGroup().addTo(mymap);
let warstwaHeatMapy = L.featureGroup().addTo(mymap);



function wylogujUzytkownika() {
    const response = fetch('/Wylogowywanie').then(function(response) {
        window.location.replace('http://localhost:3000/');       
    })    
}
  
async function naniesHeatmape() {
    sciezkiNaMapie.clearLayers();
    warstwaHeatMapy.clearLayers();
    let dane = [];
    let tabelaWspolrzednych = [];
    const response = await fetch("/heatmapa");
    const zawartosc = await response.json();
    //console.log(zawartosc.body);
    for(let i = 0; i < zawartosc.length; i++){
        let suroweDane = parser.parseFromString(zawartosc[i].odebraneDane,"text/xml");
        dane[i] = suroweDane;
        //console.log(suroweDane);
        
       for(let j = 0; j < zawartosc.length; j++){
   
                for (let index = 0; index < suroweDane.getElementsByTagName('trkpt').length; index++) {
                    tabelaWspolrzednych.push([suroweDane.getElementsByTagName('trkpt')[index].attributes["lat"].value,suroweDane.getElementsByTagName('trkpt')[index].attributes["lon"].value,0.1])
                }
                for (let index = 0; index < suroweDane.getElementsByTagName('rtept').length; index++) {
                    tabelaWspolrzednych.push([suroweDane.getElementsByTagName('rtept')[index].attributes["lat"].value,suroweDane.getElementsByTagName('rtept')[index].attributes["lon"].value,0.1])
                }    
                for(let item of tabelaWspolrzednych){
                    item[2] = (1/tabelaWspolrzednych.length)*3000;
                }
        }     
        //console.log(dane[i]);
    }
    console.log(tabelaWspolrzednych);
    //let heatmapa = await L.heatLayer(tabelaWspolrzednych,{radius: 10}).addTo(mymap);
    let heatmapa = await L.heatLayer(tabelaWspolrzednych,{radius: 10}).addTo(warstwaHeatMapy);
}

function wyczyscMape() {
    warstwaHeatMapy.clearLayers();
    sciezkiNaMapie.clearLayers();
}

async function naniesMojaHeatmape() {
    warstwaHeatMapy.clearLayers();
    sciezkiNaMapie.clearLayers();
    let dane = [];
    let tabelaWspolrzednych = [];
    const response = await fetch("/heatmapaUzytkownika");
    const zawartosc = await response.json();
    //console.log(zawartosc.body);
    for(let i = 0; i < zawartosc.length; i++){
        let suroweDane = parser.parseFromString(zawartosc[i].odebraneDane,"text/xml");
        dane[i] = suroweDane;
        //console.log(suroweDane);
        
       for(let j = 0; j < zawartosc.length; j++){
   
                for (let index = 0; index < suroweDane.getElementsByTagName('trkpt').length; index++) {
                    tabelaWspolrzednych.push([suroweDane.getElementsByTagName('trkpt')[index].attributes["lat"].value,suroweDane.getElementsByTagName('trkpt')[index].attributes["lon"].value,0.1])
                }
                for (let index = 0; index < suroweDane.getElementsByTagName('rtept').length; index++) {
                    tabelaWspolrzednych.push([suroweDane.getElementsByTagName('rtept')[index].attributes["lat"].value,suroweDane.getElementsByTagName('rtept')[index].attributes["lon"].value,0.1])
                }    
                for(let item of tabelaWspolrzednych){
                    item[2] = (1/tabelaWspolrzednych.length)*10000;
                }
        }     
        //console.log(dane[i]);
    }
    console.log(tabelaWspolrzednych);
    let heatmapa = await L.heatLayer(tabelaWspolrzednych,{radius: 10}).addTo(warstwaHeatMapy);
}

const input = document.querySelector('input[type="file"]');
const wprowadzonaNazwa = document.querySelector("input[type='text']");
const nazwaWyszukiwanegoPliku = document.getElementById("nazwaSzukanegoPliku").value;

function zatwierdzenieWybraniaPliku (){
    sciezkiNaMapie.clearLayers();
    let plik;
    console.log(input.files[0]);
    reader.onload = ()=>{
        daneZPliku = reader.result;
        dane = parser.parseFromString(daneZPliku,"text/xml");
        console.log(dane);
        
        const nazwaPliku = wprowadzonaNazwa.value;
        const plik = {daneZPliku, nazwaPliku};
        const czas = Date.now()

        const options ={
            method: 'POST',
             headers: {
                'Content-Type': 'application/json'
              }, 
            body: JSON.stringify(plik)
    
        }    
        
        let tabelaWspolrzednych = [];
        for (let index = 0; index < dane.getElementsByTagName('trkpt').length; index++) {
            tabelaWspolrzednych.push([dane.getElementsByTagName('trkpt')[index].attributes["lat"].value,dane.getElementsByTagName('trkpt')[index].attributes["lon"].value])
        }
        for (let index = 0; index < dane.getElementsByTagName('rtept').length; index++) {
            tabelaWspolrzednych.push([dane.getElementsByTagName('rtept')[index].attributes["lat"].value,dane.getElementsByTagName('rtept')[index].attributes["lon"].value])
        }    

        console.log(tabelaWspolrzednych);

        rysowanieTrasy(tabelaWspolrzednych);

        fetch('/api', options)        
    }
    reader.readAsText(input.files[0])  
}

async function pobierzDaneZSerwera() {
    sciezkiNaMapie.clearLayers();
    const nazwaPliku = document.getElementById("nazwaSzukanegoPliku").value;
    const jsonBody ={ nazwaPliku } ;

    const options ={
        method: 'POST',
         headers: {
            'Content-Type': 'application/json'
          }, 
        body: JSON.stringify(jsonBody)

    }    
    
    const response = await fetch('/bazaDanych', options);
    const zawartosc = await response.json();
    
        
    console.log(zawartosc);
    
    for(item of zawartosc){
        console.log(parser.parseFromString(item.daneZPliku,"text/xml"));
     
        
        let tabelaWspolrzednych = [];
        let tabelaPunktowNaTrasie = [];
        console.log(item.odebraneDane);
        const daneWXml = parser.parseFromString(item.odebraneDane,"text/xml");
    
        for (let index = 0; index < daneWXml.getElementsByTagName('wpt').length; index++) {
            tabelaPunktowNaTrasie.push([daneWXml.getElementsByTagName('wpt')[index].attributes["lat"].value,daneWXml.getElementsByTagName('wpt')[index].attributes["lon"].value, daneWXml.getElementsByTagName('wpt')[index].innerHTML])
        }
    
        for (let index = 0; index < daneWXml.getElementsByTagName('trkpt').length; index++) {
            tabelaWspolrzednych.push([daneWXml.getElementsByTagName('trkpt')[index].attributes["lat"].value,daneWXml.getElementsByTagName('trkpt')[index].attributes["lon"].value])
        }
        for (let index = 0; index < daneWXml.getElementsByTagName('rtept').length; index++) {
            tabelaWspolrzednych.push([daneWXml.getElementsByTagName('rtept')[index].attributes["lat"].value,daneWXml.getElementsByTagName('rtept')[index].attributes["lon"].value])
        }       


        console.log(tabelaWspolrzednych);
        console.log(tabelaPunktowNaTrasie);

        rysowanieTrasy(tabelaWspolrzednych);  
    }
    
    

    
}
function rysowanieTrasy(punktyTrasy) {
       

    const trasa = new L.polyline(punktyTrasy, {
        color: 'red',
        weight: 3,
        opacity: 0.3,
        smoothFactor: 1
    }).addTo(sciezkiNaMapie);
    
}








/* const input = document.querySelector('input[type="file"]');
input.addEventListener('change', function(e){
    let plik;
    console.log(input.files[0]);
    reader.onload = ()=>{
        daneZPliku = reader.result;
        dane = parser.parseFromString(daneZPliku,"text/xml");
        console.log(dane);
        const plik = {daneZPliku};

        const options ={
            method: 'POST',
             headers: {
                'Content-Type': 'application/json'
              }, 
            body: JSON.stringify(plik)
    
        }
    
    
        fetch('/api', options)
        
    }
    reader.readAsText(input.files[0])

    
    
    
})
 */




// const u = new URL(`file:///${wyborPliku}`).href;

// wyborPliku.addEventListener('change', (e)=>{
//     let string;
//     let tabelaWspolrzednych = [];

//     let parser = new DOMParser();
//     const plikGpx = fetch('file:///C:/Users/artur/Desktop/Praca%20in%C5%BCynierska/Client/Dole_Langres.gpx').then((response) => {
//     //console.log(response.text());
   
//     return response.text();
   
//     }).then(tekst => {
//     dane = parser.parseFromString(tekst,'text/xml');
   
//     for (let index = 0; index < dane.getElementsByTagName('trkpt').length; index++) {
//         tabelaWspolrzednych.push([dane.getElementsByTagName('trkpt')[index].attributes["lon"].value,dane.getElementsByTagName('trkpt')[index].attributes["lat"].value])
       
//     }

//     console.log(dane.getElementsByTagName('trkpt')[0].attributes["lon"].value);  
   
   
// })
// })

   

/* 

let parser = new DOMParser();
const plikGpx = fetch(wyborPliku.files[0]).then((response) => {
    //console.log(response.text());
   
    return response.text();
   
}).then(tekst => {
    dane = parser.parseFromString(tekst,'text/xml');
   
    for (let index = 0; index < dane.getElementsByTagName('trkpt').length; index++) {
        tabelaWspolrzednych.push([dane.getElementsByTagName('trkpt')[index].attributes["lon"].value,dane.getElementsByTagName('trkpt')[index].attributes["lat"].value])        
    }
    console.log(tabelaWspolrzednych[2].lat);
    
    
})
return tabelaWspolrzednych;
} */