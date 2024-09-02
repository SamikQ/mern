const { v4: uuidv4 } = require("uuid"); // бібліотечка для генерації унікального ІД
const { validationResult } = require("express-validator"); // додаємо метод Валідейшн резалт який працює в парі з Валідатором в places-routes;

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "one of the most famous sky crapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "NY 10001",
    creator: "u1",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid; // { pid: p1} <--- так відпрацьовує метод експресу params на req
  const place = DUMMY_PLACES.find((item) => {
    return item.id === placeId;
  }); // за допомогою функції JS перебираємо масив і повертаємо необхідне значення

  if (!place) {
    throw new HttpError("Could not find a place for provided ID!"); // throw --- тригерить ерор хендлер мідлвейр який ми створили в апп з 4 параметрами
    // next(error);  <---- обовязково використовувати next(), якщо працюємо з БД та асинхронним кодом
  }
  // return перериває виконання всіх наступних рядків
  res.json({ place: place }); // використовуємо метод json() для передачі даних
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid; // { pid: p1} <--- так відпрацьовує метод експресу params на req
  const places = DUMMY_PLACES.filter((item) => {
    return item.creator === userId;
  }); // за допомогою функції JS перебираємо масив і повертаємо необхідне значення

  if (!places || places.length === 0) {
    return next(new HttpError("Could not find  places for provided ID!"), 404); // next не прериває подальше виконання коду, тому треба return
  }

  res.json({ places }); // використовуємо метод json() для передачі даних
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req); // передаємо реквест до функції Валідатору, яка перевірить, чи виконані умови, зазначені в роутсах
  if (!errors.isEmpty()) {
    //next() ОБОВЯЗКОВЕ ВИКОРИСТАННЯ ЗАМІСТЬ THROW який не буде працювати корректно, Так як працюємо з асинхронним кодом
    next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { title, description, address, creator } = req.body; //визначаємо необхідні елементи з тіла запиту

  let coordinates;
  // getCoordsForAddress може видати помилку, тому нам треба робити це через try catch
  try {
    coordinates = getCoordsForAddress(address);
  } catch (error) {
    return next(error); // Прериваємо код і перенаправляємо помилку далі в нашу спеціальну функцію
  }

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace); //за допомогою функції push додаємо до масиву обєкт

  res.status(201).json({ place: createdPlace }); // код 201 - за конвецією, якщо ми щось додаємо
};

const updatePlaceById = (req, res, next) => {
  const errors = validationResult(req); // передаємо реквест до функції Валідатору, яка перевірить, чи виконані умови, зазначені в роутсах
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatePlace = { ...DUMMY_PLACES.find((item) => item.id === placeId) }; // створємо копію массиву, так як мутувати массив на пряму в JS не можна
  const placeIndex = DUMMY_PLACES.findIndex((item) => item.id === placeId); // знаходимо індекс, за яким необхідно замінити обєкт массиву
  // оновлюємо параметри, які хочемо оновити
  updatePlace.title = title;
  updatePlace.description = description;

  DUMMY_PLACES[placeIndex] = updatePlace; // заміняємо необхідний елемент массиву на оновлений массив

  res.status(200).json({ place: updatePlace }); // повертаємо респонс (200, так як ми нічого нового не створювали)
};

const deletePlaceById = (req, res, next) => {
  //варіант видалення елементу з масиву по уроку: (можна видаляти лише зі змінної let)
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((place) => place.id === placeId)) {
    throw new HttpError("Couldnt find a place by that id.", 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((item) => item.id !== placeId);

  // мій варіант видалення елементу з массиву (можна видаляти зі змінної const)
  // const placeId = req.params.pid;
  // const placeIndex = DUMMY_PLACES.findIndex(item => item.id !== placeId);
  // DUMMY_PLACES.splice(placeIndex, 1);

  res.status(200).json({ message: "Succesfully removed" });
};

exports.getPlaceById = getPlaceById; // якщо поставити дужки в кінці, до функція буде викликана!
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
