
let value;

App = {

    web3Provider: null,
    contracts: {},
    abi:{},

    init: async () => {
        return await App.initWeb3();
    },

    initWeb3: async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
            // Request account access
            await window.ethereum.request({ method: "eth_requestAccounts" });;
            } catch (error) {
            // User denied account access...
            console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        return await App.initContract();
    },

    initContract: async () => {

        await $.getJSON('../build/contracts/Car.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with @truffle/contract
            const CarArtifact = data;
            App.abi =data.abi;
            App.contracts.Car = TruffleContract(CarArtifact);

            // Set the provider for our contract
            App.contracts.Car.setProvider(App.web3Provider);
        });
        return await App.allCars();

    },

        allCars: async () => {
            let carInstance;
            await web3.eth.getAccounts(function(error, accounts) {
                if (error) {
                    console.log(error);
                }

                const account = accounts[0];

                App.contracts.Car.deployed().then(function(instance) {
                    let carInstance=instance;
                    return carInstance.getNoBuyCarsList();

                }).then(function(result) {

                    if(result.length!=0){

                        for(i=0 ; i< result.length; i++){


                            if(result[i].name!=0){

                                console.log(result[i].name)
                                const ethValue = web3.utils.fromWei(result[i].price, 'ether');
                                var item = createdCarItem(result[i].carId,
                                                          result[i].name,
                                                          result[i].description,
                                                          ethValue,
                                                          result[i].price,
                                                          result[i].image,
                                                          result[i].owner,
                                                          account);
                                console.log(item);
                                $(".container").append(item);

                            }
                        }
                    }

                }).catch(function(err) {
                    alert("Error " + err)
                });
            });
        },

    buyCars : async (carId,price) => {
        await web3.eth.getAccounts(function(error, accounts) {

            if (error) {
                console.log(error);
            }

            const account = accounts[0];

            App.contracts.Car.deployed().then(function(instance) {
            let carInstance=instance;

            const transactionObject = {
                    from: account,
                    gas: 6721975,
                    gasPrice: 6721975,
                    value: price
            };
            accounts.push(carInstance.address);
            const myContract = new web3.eth.Contract(App.abi, accounts[1]);
            return myContract.methods.buyCar(carId).send(transactionObject);

        }).then(function(result) {
                console.log(result);
                $(`#car-${carId}`).remove();
                alert("Comprata");
        }).catch(function(err) {
            console.log(err);
            alert("Non comprata: " + err);
        });
        });

    },

    deleteCars : async (carId) => {
        try {

            const carInstance = await App.contracts.Car.deployed();
            const account = await web3.eth.getAccounts();
            await carInstance.cancel(carId,{from: account[0]});
            $(`#car-${carId}`).remove();
            alert("cancellata!");


        } catch (error) {
            console.error(error);

            alert("Error in the car: " + error);
        }

    }

}

const createdCarItem = (carId, name, description, ethValue, price, image, owner, sender) => {



    const item = `<div class="card" xmlns="http://www.w3.org/1999/html" id="car-${carId}">
        <div class="card__body">
          <img src="../images/${image}" style="height: 70px; width : 70px ;border-radius: 50%;">
          <b> <h2 style="color:#654f2d">${name}</h2> </b>
          <h3>Descrizione</h3>
          <h5>${description}</h5>
          <h5><b>Prezzo: ${ethValue} ETH</E></b></h5>
        </div>
    
        <div class="card__footer">
              <div class="user">
                  ${ !(owner.localeCompare(sender)) ? '' : '<input type="button" name="purchase-button" id="button-'+ carId +'" onclick="App.buyCars(' + carId + ','+price+')" class="tag tag-brown" value="Buy Car">'}
                   ${ owner.localeCompare(sender) ? '' : '<input type="button" name="cancel-button" id="button-del-'+ carId +'" onclick="App.deleteCars(' + carId + ')" class="tag tag-brown" value="Delete Adv">'}
              
              </div>
        </div>
     </div>`

  return item;

}

$(function() {
    $(window).load(function() {
        App.init();

    });
});

