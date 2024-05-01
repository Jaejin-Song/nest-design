import Input from '../input.vue'

describe('<Input />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(Input)
  })
})