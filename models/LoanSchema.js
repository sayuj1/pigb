import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loanType: { type: String, enum: ["taken", "given"], required: true }, 
  borrowerName: { type: String, required: function () { return this.loanType === "taken"; } }, 
  lenderName: { type: String, required: function () { return this.loanType === "given"; } }, 
  loanCategory: { 
    type: String, 
    required: true 
  }, 
  amount: { type: Number, required: true },
  interestRate: { type: Number, default: 0 },
  tenureMonths: { type: Number, required: false }, //optional
  emiAmount: { type: Number, required: false },
  dueDate: { type: Date, required: false },
  status: { type: String, default: "active" },
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  remainingBalance: { type: Number, default: function () { return this.amount; } },
  createdAt: { type: Date, default: Date.now },
});

LoanSchema.pre("save", function (next) {
  if (this.tenureMonths && this.interestRate > 0) {
    const monthlyInterest = this.interestRate / 100 / 12;
    const emi =
      (this.amount * monthlyInterest * Math.pow(1 + monthlyInterest, this.tenureMonths)) /
      (Math.pow(1 + monthlyInterest, this.tenureMonths) - 1);
    this.emiAmount = Math.round(emi);
  }

  this.remainingBalance = this.amount - this.payments.reduce((sum, p) => sum + p.amount, 0);

  if (this.remainingBalance <= 0) {
    this.remainingBalance = 0;
    this.status = "completed";
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = "overdue";
  } else {
    this.status = "active";
  }

  next();
});

const Loan = mongoose.models.Loan || mongoose.model("Loan", LoanSchema);
export default Loan;
