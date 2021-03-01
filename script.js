const Modal = {
    open() {
        // abrir modal 
        // adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active');
    }, 
    close() {
        // fechar o modal
        // remover a class active do modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {  // local de armazenamento do navegador "local storage"
    get() {
        // de string para array/objeto
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) // json.stringify transforma coisas em STRING
    }
}

const Transaction = {  // calculo matemático
    all: Storage.get(), 

    add(transaction) {
        Transaction.all.push(transaction)  //o push coloca algo no array
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes () {
        let income = 0;
        // pegar todas as transações
        // para cada transação
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero 
            if (transaction.amount > 0) {
                //somar a uma variavel e retornar uma variavel   
                income += transaction.amount;   
            }
        })  
        return income;
    },
    expenses() {
        let expense = 0;
        // pegar todas as transações
        // para cada transação
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero 
            if (transaction.amount < 0) {
                //somar a uma variavel e retornar uma variavel   
                expense += transaction.amount;   
            }
        })  
        return expense;
    },
    total () {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) // o index é a posição do array no objeto
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) { // substituição
        const CSSclass = transaction.amount > 0 ? "income" : "expense" // operador ternário 

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `                   
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html
    },

    updateBalance() {  // acessando do balanço
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {  // estilizar os números 
    formatAmount(value) {
        value = Number(value) * 100
        return value
    },

    formatDate(date) { 
        const splittedDate = date.split("-") // separa pelo "-"
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency", 
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {
    // linka o elemento html com o Id description(o input) com a propriedade description do objeto Transaction
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {  // objeto que armazena os VALORES de description, amount, date
        return {
            description: Form.description.value,
            amount: Form.amount.value, 
            date: Form.date.value,
        }
    },

    validateFields() {
        // pega todos os valores dos campos e armazena nas variáveis de forma respectiva
        const { description, amount, date } = Form.getValues()
        // trim serve para limpar os espaços vazios(backspaces)
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!") // objeto padrão para tratamento de erros
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return {  // quando o nome das variáveis é igual ao nome das chaves do objeto não é necessário repetir: "value: value"
            description, 
            amount, 
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault() // altera o comportamento padrão

       try {
         // verificar se todas as informações foram preenchidas
        Form.validateFields()
        // formatar os dados para salvar
        const transaction = Form.formatValues()
        // salvar 
        Transaction.add(transaction)
        // apagar os dados do formulário para colocar a próxima transação 
        Form.clearFields()
        // modal fecha
        Modal.close()
          } catch (error) {
              alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(function(transaction, index) {
            DOM.addTransaction(transaction, index)
        })     

        DOM.updateBalance()
        
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
