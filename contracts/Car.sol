//Una licenza software su cui terremo il programma
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Car is ERC721 {



    constructor() ERC721("Car", "CAR")  {
    }

    using Counters for Counters.Counter;

    //Variabile che permette di gestire gli id delle car
    Counters.Counter private carsIds;
    Counters.Counter private counterNoBuy;
    //per tenere traccia di tutte le info relative alle car
    mapping (uint256 => CarInfo) cars;
    //mapping di tutti i token posseduti da un indirizzo
    mapping (address => uint256[]) ownedCars;
    mapping (uint256 => CarInfo) noBuyCars;


    struct CarInfo{
        address payable owner;
        //Identifiativo della macchina

        uint256 carId;
        string name;
        //Prezzo auto
        uint256 price;
        //Descrizione
        string description;
        //Immagine
        string image;
        //Stato della macchina (true la macchina è in vendita)
        bool used;
    }

    function addCar(string memory name, uint price, string memory description,  string memory image) public returns (uint256) {

        uint256 newCarId = carsIds.current();
        address payable owner = payable(msg.sender);

        //Incremento l'id del biglietto
        carsIds.increment();
        //true la macchina è in vendita

        cars[newCarId] = CarInfo(owner, newCarId, name, price, description, image, true);

        noBuyCars[newCarId]=cars[newCarId];
        counterNoBuy.increment();
        //Lo inserisco tra quelli posseduti da un indirizzo
        ownedCars[owner].push(newCarId);

        return newCarId;

    }

    function sellMyCar(uint256 carId) public {

        require(cars[carId].used != true, "Macchina gia in vendita");
        counterNoBuy.increment();

        noBuyCars[carId] = CarInfo(cars[carId].owner, carId, cars[carId].name, cars[carId].price, cars[carId].description, cars[carId].image, true);
        cars[carId].used=true;

    }


    function buyCar(uint256 carId) public payable returns(bool){
        require(cars[carId].used == true, "Macchina non disponibile");
        require(cars[carId].owner != msg.sender, "Non puoi acquistare quello che metti in vendita");
        require(msg.sender.balance > cars[carId].price, "Non hai soldi sufficienti");

        //invio i soldi
        cars[carId].owner.transfer(msg.value);
        cars[carId].used = false;
        //elimino dalla lista delle macchine del proprietario precedente
        delete ownedCars[cars[carId].owner];
        //adesso non è più vendibile
        delete noBuyCars[carId];
        //incremento il contatore degli annunci
        counterNoBuy.increment();
        //metto l'indirizzo nuovo alla macchina
        cars[carId].owner = payable(msg.sender);

        //metto nella lista della macchina del proprietario
        ownedCars[cars[carId].owner].push(carId);



        return true;
    }


    function cancel(uint256 carId) public {

        require(cars[carId].used == true, "La macchina selezionata non in vendita");
        require(msg.sender == cars[carId].owner, "Solo i venditori possono cancellare");
        counterNoBuy.decrement();
        delete noBuyCars[carId];
        cars[carId].used = false;

    }

    function  getCarsList() public view returns (CarInfo[] memory){
        CarInfo[] memory toReturnCars = new CarInfo[](carsIds.current());
        for(uint i = 0; i < carsIds.current(); i++) {
                toReturnCars[i] = cars[i];
        }
        return toReturnCars;
    }


    function  getNoBuyCarsList() public view returns (CarInfo[] memory){
        CarInfo[] memory toReturnCars = new CarInfo[](counterNoBuy.current());
        for(uint i = 0; i < counterNoBuy.current(); i++) {
                toReturnCars[i] = noBuyCars[i];
        }
        return toReturnCars;
    }


    function getCarsListByOwner() public view returns(CarInfo[] memory){
        uint256[] memory allCarsId;

        allCarsId = ownedCars[msg.sender];

        CarInfo[] memory toReturnCars = new CarInfo[](allCarsId.length);

        for(uint i = 0; i < allCarsId.length; i++) {
            toReturnCars[i]  = cars[allCarsId[i]];
        }

        return toReturnCars;
    }

    function getACarById(uint carId) public view returns (CarInfo memory){

        return cars[carId];

    }




}







