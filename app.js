//Variables
const cartBtn = document.querySelector('.cartbtn')
const closecartBtn = document.querySelector('.close-cart')
const clearcart = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products-center')


//cart
let cart = []
let buttonsDOM = []


//get products
class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json')
            let data = await result.json()    
            let products = data.items
            products = products.map(item => {
                const {title, price} = item.fields
                const {id} = item.sys
                const image = item.fields.image.fields.file.url
                return {title, price, id, image}
            })
            return products
        } catch (error) {
            console.log(error)
        }  
    }
}

//display products
class UI {
    displayProducts(products) {
        let result = ''
        products.forEach(product => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}" class="product-img">
                    <button class="bag-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>`
        })
        productsDOM.innerHTML = result
    }

    getbagButtons() {
        const btns = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = btns
        btns.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id)
            
            if (inCart) {
                button.innerText  = ' in Cart'
                button.disabled = true
            }

            button.addEventListener("click", event => {
                event.target.innerText = ' in Cart'
                event.target.disabled = true

                //get products from products
                let cartItem = { ...storage.getProducts(id), amount: 1 }
                //add products to the cart
                cart = [...cart, cartItem]
                //save cart in local storage
                storage.saveCart(cart)
                //set cart values
                this.setCartValues(cart)
                //display cart item
                this.addCartItem(cartItem)
                //show the cart
                this.showCart()
            })
        })
    }

    setCartValues(cart) {
        let tempTotal = 0
        let itemTotal = 0

        cart.map(item => {
            tempTotal += item.price * item.amount
            itemTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemTotal
    }

    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
            <img src="${item.image}">
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">
                    ${item.amount} 
                </p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`
        
        cartContent.appendChild(div)
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('show-cart')
    }

    setupAPP() {
        cart = storage.getCart()
        this.setCartValues(cart)
        this.populateCart(cart)
        cartBtn.addEventListener('click', this.showCart)
        closecartBtn.addEventListener('click', this.hideCart)
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('show-cart')
    }

    populateCart(cart) {
        cart = cart.forEach(item => this.addCartItem(item))
    }

    cartLogic() {
        clearcart.addEventListener('click', () => {
            this.clearCart()})

        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeitem = event.target
                let id = removeitem.dataset.id
                cartContent.removeChild(removeitem.parentElement.parentElement)
                this.removeitem(id)
            }
            else if (event.target.classList.contains('fa-chevron-up')) {
                let addamount = event.target
                let id = addamount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount + 1
                storage.saveCart(cart)
                this.setCartValues(cart)
                addamount.nextElementSibling.innerText = tempItem.amount  
            }
            else if (event.target.classList.contains('fa-chevron-down')) {
                let loweramount = event.target
                let id = loweramount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1
                if (tempItem.amount > 0) {
                    storage.saveCart(cart)
                    this.setCartValues(cart)
                    loweramount.previousElementSibling.innerText = tempItem.amount
                } else {
                    cartContent.removeChild(loweramount.parentElement.parentElement)
                    this.removeitem(id)
                }
            }
        })
        
    }

    clearCart() {
        let cartitems = cart.map(item => item.id)
        cartitems.forEach(id => this.removeitem(id))
        while (cartContent.children.length > 0) {
                cartContent.removeChild(cartContent.children[0])
        }
    }

    removeitem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart)
        storage.saveCart(cart)
        let button = this.singleButton(id)
        button.disabled = false
        button.innerHTML = `<i class="fas fa-shopping-cart">
        Add to Cart</i>`
    }

    singleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    }
}

//local storage 
class storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }

    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }

    static getCart() {
       return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [] 
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI()
    const products = new Products()

    ui.setupAPP()

    products.getProducts().then(products => {
        ui.displayProducts(products)
        storage.saveProducts(products)
    }).then(() => {
        ui.getbagButtons()
        ui.cartLogic()
    })
})