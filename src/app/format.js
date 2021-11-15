export const formatDate = (dateStr) => {
  //console.log("in format date : ", dateStr);

  //Review OCR
  //Si la date est incorrect est n'est pas transmise alors on la change par une date bidon
  //Sinon le panneau des notes de frais validé ne se déroulent pas.
  if (dateStr) {
    const date = new Date(dateStr);
    //console.log(date);
    const ye = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(date);
    const mo = new Intl.DateTimeFormat("fr", { month: "short" }).format(date);
    const da = new Intl.DateTimeFormat("fr", { day: "2-digit" }).format(date);
    const month = mo.charAt(0).toUpperCase() + mo.slice(1);
    return `${parseInt(da)} ${month.substr(0, 3)}. ${ye
      .toString()
      .substr(2, 4)}`;
  }
};

export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "accepted":
      return "Accepté";
    case "refused":
      return "Refused";
  }
};
