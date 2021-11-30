
async function zalogujUzytkownika() {
    const nazwaUzytkownika = document.getElementById("login").value;
    const hasloUzytkownika = document.getElementById('haslo').value;
    jsonZDanymi ={
        login: nazwaUzytkownika,
        haslo: hasloUzytkownika
    }
    
    const options ={
        method: 'POST',
         headers: {
            'Content-Type': 'application/json'
          }, 
        body: JSON.stringify(jsonZDanymi)
    
    }    
    const response = await fetch('/', options);
    //console.log(response);
    //const zalogowanyUzytkownik = await response.json();
    //window.localStorage.setItem('login',nazwaUzytkownika);
    
}





