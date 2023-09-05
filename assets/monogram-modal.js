class MonogramModal extends HTMLElement {
    constructor() {
        super();

        const exitButton = document.querySelector(".monogram-modal-exit");

        this.triggers = {
            open: document.querySelectorAll('[id^="MonogramModal-Trigger"]'),
            close: exitButton
        }

        this.data = {
            productVariantId: this.dataset.variantId,
            monogramVariantId: this.dataset.monogramVariantId,
        }

        this.elements = {
            inputs: {
                color: document.querySelectorAll('[id^="MonogramModal-Input-Color"]'),
                font: document.querySelectorAll('[id^="MonogramModal-Input-Font"]'),
                location: document.querySelectorAll('[id^="MonogramModal-Input-Location"]'),
                text: document.querySelector('[id^="MonogramModal-Input-Text"]'),
            },
            submitButton: document.querySelector('[id^="MonogramModal-Button-Submit"]'),
            preview: document.querySelector('[id^="MonogramModal-Preview"]')
        }

        this.values = {
            color: this.elements.inputs.color[0].dataset.nameValue,
            font: this.elements.inputs.font[0].value,
            text: this.elements.inputs.text.value,
            location: this.elements.inputs.location[0].value,
        }

        this.setupTriggers();
        this.setupPreview();

        if (this.elements.submitButton) {
            this.elements.submitButton.addEventListener('click', this.submit.bind(this));
            this.validateInput();
        }
    }

    validateInput() {
        if (this.elements.inputs.text.value === "") {
            this.elements.submitButton.disabled = true;
        } else {
            this.elements.submitButton.disabled = false;
        }

        this.elements.inputs.text.addEventListener('input', () => {
            if (this.elements.inputs.text.value === "") {
                this.elements.submitButton.disabled = true;
            } else {
                this.elements.submitButton.disabled = false;
            }
        });
    }

    /*checkCheckboxes() {
        const anyChecked = Array.from(this.elements.inputs.location).some(input => input.checked);
        const isTextInputEmpty = this.elements.inputs.text.value.trim() === "";
        
        if (!anyChecked || isTextInputEmpty) {
            this.elements.submitButton.disabled = true;
        } else {
            this.elements.submitButton.disabled = false;
        }
    }*/

    generateHash() {
        const data = `${this.values.color}_${this.values.font}_${this.values.text}_${this.values.location}_${this.data.productVariantId}_${this.data.monogramVariantId}`;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    togglePreviewDiv() {
        const previewDiv = document.querySelector(".monogram-preview-container");
        const inputField = document.querySelector(".monogram-modal-input");

        if (inputField.value.trim() === "") {
            previewDiv.style.display = 'none';
        } else {
            previewDiv.style.display = 'block';
        }
    }

    setupTriggers() {
        this.triggers.open.forEach((trigger) => {
            trigger.addEventListener('click', this.open.bind(this));
        });

        this.triggers.close.addEventListener('click', this.close.bind(this));
    }

    setupPreview() {
        this.updatePreview();
        this.togglePreviewDiv();

        this.elements.inputs.color.forEach((input) => {
            input.addEventListener('change',
                this.updatePreview.bind(this));
            this.togglePreviewDiv();
        });

        this.elements.inputs.font.forEach((input) => {
            input.addEventListener('change',
                this.updatePreview.bind(this));
            this.togglePreviewDiv();
        });

        this.elements.inputs.location.forEach((input) => {
            input.addEventListener('change', () => {
                this.updatePreview();
                this.togglePreviewDiv();
                //this.checkCheckboxes();
            });
        });

        this.elements.inputs.text.addEventListener('input', () => {
            this.updatePreview();
            this.togglePreviewDiv();
            //this.checkCheckboxes();
        });

        //this.checkCheckboxes();
    }

    updatePreview() {
        let color = this.elements.inputs.color[0].value;

        this.elements.inputs.color.forEach((input) => {
            if (input.checked) {
                color = input.value;
                this.values.color = input.dataset.nameValue;
            }
        });

        let font = this.elements.inputs.font[0].value;

        this.elements.inputs.font.forEach((input) => {
            if (input.checked) {
                font = input.value;
                this.values.font = font;
            }
        });

        //let selectedLocations = [];
        let location = this.elements.inputs.location[0].value;

        this.elements.inputs.location.forEach((input) => {
            if (input.checked) {
                //selectedLocations.push(input.value);
                location = input.value;
                this.values.location = location;
            }
        });
        
        //let output = selectedLocations.join(", ");

        //this.values.location = output;

        const text = this.elements.inputs.text.value;
        this.values.text = text;

        this.elements.preview.style.color = color;
        this.elements.preview.dataset.font = font;
        this.elements.preview.innerHTML = text;
    }

    open() {
        const modalContent = document.querySelector('.monogram-modal-content');
        this.toggleAttribute('hidden');
        modalContent.classList.add("show");
        modalContent.classList.remove("hide");
        document.body.style.overflow = "hidden";
        document.body.style.height = "100%";
    }

    close() {
        const modalContent = document.querySelector('.monogram-modal-content');
        this.toggleAttribute('hidden');
        modalContent.classList.add("hide");
        modalContent.classList.remove("show");
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
    }

    submit() {
        const hash = this.generateHash();

        const productData = {
            _productVariantId: this.data.productVariantId,
            _monogramVariantId: this.data.monogramVariantId,
            _hash: hash,
            'Color': this.values.color,
            'Font': this.values.font,
            'Text': this.values.text,
            'Location': this.values.location,
        }

        this.addToCart(productData);
    }

    addToCart(productData) {
        const data = {
            items: [
                {
                    quantity: 1,
                    id: productData._productVariantId,
                    properties: productData
                },
                {
                    quantity: 1,
                    id: productData._monogramVariantId,
                    properties: productData
                }
            ]
        }

        fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(data => {
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}

if (customElements.get('monogram-modal') === undefined) {
    customElements.define('monogram-modal', MonogramModal);
}