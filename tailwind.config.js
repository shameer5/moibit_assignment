module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      boxShadow: {
        'custom': 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;'
      },
      fontFamily:{
        nunito: ['Nunito'],
        poppins: ['Poppins']
      },
      spacing: {
        'xl': '41rem'
      },
      transitionDuration: {
        '1500': '1500ms',
       },
       translate: {
        '200': '-60rem',
        '300': "60rem"
       },
       gridTemplateColumns: {
       '14': 'repeat(14, minmax(0, 1fr))',
      },
      screens: {
        'xs': '475px'
      }
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      borderColor: ['active'],
      boxShadow: ['focus'],
    },
  },
  plugins: [],
}
