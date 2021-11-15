import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.firestore = firestore;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    new Logout({ document, localStorage, onNavigate });

    this.errorMessageElement = document.getElementById("error-filetype");
  }
  handleChangeFile = (e) => {
    //Review OCR
    //Authorized files extension
    const authExtension = ["jpg", "jpeg", "png"];
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    //Get file extension
    console.log(file);
    const extendFile = file.type.split("/")[1];
    console.log(extendFile);
    //Control file validate extension
    if (authExtension.includes(extendFile)) {
      // console.log("fichiers ok");
      document.getElementById("error-filetype").classList.add("hide");
      const filePath = e.target.value.split(/\\/g);
      const fileName = filePath[filePath.length - 1];
      //Add conditonnal to pass test
      if (this.firestore) {
      this.firestore.storage
        .ref(`justificatifs/${fileName}`)
        .put(file)
        .then((snapshot) => snapshot.ref.getDownloadURL())
        .then((url) => {
          this.fileUrl = url;
          this.fileName = fileName;
        });
      }
    } else {
      // Show error message if extension files is wrong
      e.target.value = "";
      this.errorMessageElement.classList.remove("hide");
      setTimeout(() => {
        this.errorMessageElement.classList.add("hide");
      }, 2000);
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();
    /* console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );*/
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.createBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  createBill = (bill) => {
    if (this.firestore) {
      this.firestore
        .bills()
        .add(bill)
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => error);
    }
  };
}
