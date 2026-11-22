
import logoMedTime from '/assets/logo.png'

export default function LogoMedTime({ largura = 180 }) {
  return (
    <img
      src={logoMedTime}
      alt="MedTime"
      style={{
        width: largura,
        height: 'auto',
        objectFit: 'contain'
      }}
    />
  )
}
