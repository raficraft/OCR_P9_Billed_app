import {
  screen,
  getByTestId,
  getAllByTestId,
  getByText,
} from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { setSessionStorage } from "../../setup-jest";

import Firestore from "../app/Firestore";
import firebase from "../__mocks__/firebase";

import Router from "../app/Router.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import Bills from "../containers/Bills";
import BillsUI from "../views/BillsUI.js";




// Define Session - Employee
setSessionStorage("Employee");

// Init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

//Call BiilsUI to construct page with data mocked
const constructBillsUi = () => {
  const html = BillsUI({ data: bills });
  document.body.innerHTML = html;
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    /**
     * Dans ce premier test on souhaite verifier la présence
     * d'une classe sur un élemément HTML
     *
     * - Definie la Route
     * - Mock les données
     * - On ce positionne sur la page [bills]
     * - Inject Dom
     * - Get Element
     * - If Element exist [ except(el).assert() ]
     * - If class "active-icon" [ except(el).assert() ]
     *
     **/

    test("Then bill icon in vertical layout should be highlighted", () => {
      // Routing variable
      const pathname = ROUTES_PATH["Bills"];
      //We recover a copy of the mocked data
      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });

      // Define pathname : #employee/bills
      location.assign(pathname);

      // Create Dom HTML
      document.body.innerHTML = `<div id="root"></div>`;
      // Trigger the router to set up the page
      Router();
      //Get icon element
      const icon = getByTestId(document.body, "icon-window");
      //Check if exist
      expect(icon).toBeTruthy();
      //Check class value
      expect(icon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      /**
       * [Bug fix] les notes de frais ne s'affichait pas dans le bonne ordre
       */

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I click on the button 'Nouvelle note de frais'", () => {
    //Data-testid = btn-new-bill
    test("Then I should navigate to #employee/bill/new", () => {
      /**
       * Dans ce premier cas on verifie que l'on navigue
       *  bien vers la page newBills
       *
       * - On insert les élement de la page newBills dans le dom
       * - on mock la function de redirection
       * - On récupère l'element dans le dom
       * - On simule le click sur le bouton
       * - On verifie qu'un des élément contenue dans la page bills
       * est affiché.
       **/

      // UI Construction
      constructBillsUi();

      const bills = new Bills({
        document,
        onNavigate,
        Firestore,
        localStorage: window.localStorage,
      });

      // Mock handleClickNewBill function on bills, line : 23
      const handleClickNewBill = jest.fn(bills.handleClickNewBill);

      // Get new bill button in DOM
      const btnNewBill = getByTestId(document.body, "btn-new-bill");

      //Attached events and trigged
      btnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnNewBill);

      expect(handleClickNewBill).toHaveBeenCalled();
      //check if DIV content text exists
      expect(
        getByText(document.body, "Envoyer une note de frais")
      ).toBeTruthy();
    });
  });

  describe("When I click on the eye icon", () => {
    test("A modal should open", () => {
      /**
       * Verifie que la modal s'affiche bien lors du clique
       * sur l'icone en forme d'oeil de la page bills
       *
       * - On insère la page [bills]
       * - On récupère l'icon dans le dom [collection]
       * - On mock la fonction d'affichage de la modal
       * - On simule le click et declenche la fonction sur le premier élément
       * - On récupère la modal dans le dom
       *
       * - On verifie que la fonction est bien apellé
       * - On verifie que la modal est presente
       */
      constructBillsUi();
      // Init firestore
      const firestore = null;

      // init Bills Class constructor for icon eye display
      const bills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      // Mock modal
      $.fn.modal = jest.fn();

      // Get the first button eye in DOM for test
      const firstEyeIcon = getAllByTestId(document.body, "icon-eye")[0];

      //Mock handleClickIconEye function on bills , line : 27
      const handleClickIconEye = jest.fn(
        bills.handleClickIconEye(firstEyeIcon)
      );

      //Attached events and trigged
      firstEyeIcon.addEventListener("click", handleClickIconEye);
      //trigger event click
      userEvent.click(firstEyeIcon);

      const modal = document.getElementById("modaleFile");
      expect(handleClickIconEye).toHaveBeenCalled();
      //Check if modal has show in DOM
      expect(modal).toBeTruthy();
    });
  });

  // Test API response
  describe("When navigate to Bills UI", () => {
    test("Find all bills from mock API GET", async () => {
      //On check que le call API revoie bien toutes les factures
      //Data du fichier firebase se trouvant dans le repertoire __mock__

      // Spy on Firebase Mock
      const getSpy = jest.spyOn(firebase, "get");

      // Get bills
      const bills = await firebase.get();

      expect(getSpy).toHaveBeenCalledTimes(1);
      //check if result as equal to four
      expect(bills.data.length).toBe(4);
    });

    test("Then add a new bills, if API fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );

      // UI creation with error code
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;

      const errorMessage = await getByText(document.body, "Erreur 404");
      expect(errorMessage).toBeTruthy();
    });

    test("Then add a new bills, if API fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );

      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const errorMessage = await getByText(document.body, "Erreur 500");
      expect(errorMessage).toBeTruthy();
    });
  });
});
