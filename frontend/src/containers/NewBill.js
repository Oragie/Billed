import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];

    // Vérification du type de fichier BugFixé
    const errorFileTypeMsg = this.document.querySelector(".msgErrorFiletype");
    if (!/[^\s]+(.*?).(jpg|jpeg|png)$/i.test(file.type)) {
      console.log("type fichier NON OK", file.type);
      alert("Seuls les fichiers .jpg, .jpeg et .png sont autorisés.");
      e.target.value = "";
      errorFileTypeMsg.classList.remove("hidden");
    } else {
      console.log("type fichier OK", file.type);
      errorFileTypeMsg.classList.add("hidden");
      this.fileName = fileName; // Stocker le nom du fichier pour l'envoyer plus tard lors de la soumission
    }
  };
  // fin Bug

  handleSubmit = (e) => {
    e.preventDefault();
    const email = JSON.parse(localStorage.getItem("user")).email;
    const formData = new FormData();
    formData.append(
      "file",
      this.document.querySelector(`input[data-testid="file"]`).files[0]
    );
    formData.append("email", email);

    // Créer la facture et uploader le fichier (déplacé de handleChangeFile vers handleSubmit) BugFixé
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        this.billId = key;
        this.fileUrl = fileUrl;
        // fin Bug

        const bill = {
          email,
          type: e.target.querySelector(`select[data-testid="expense-type"]`)
            .value,
          name: e.target.querySelector(`input[data-testid="expense-name"]`)
            .value,
          amount: parseInt(
            e.target.querySelector(`input[data-testid="amount"]`).value
          ),
          date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
          vat: e.target.querySelector(`input[data-testid="vat"]`).value,
          pct:
            parseInt(
              e.target.querySelector(`input[data-testid="pct"]`).value
            ) || 20,
          commentary: e.target.querySelector(
            `textarea[data-testid="commentary"]`
          ).value,
          fileUrl: this.fileUrl,
          fileName: this.fileName,
          status: "pending",
        };

        this.updateBill(bill);
        this.onNavigate(ROUTES_PATH["Bills"]);
      })
      .catch((error) => console.error(error));
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
