const FEATURES = [
  {
    icon: '🔒',
    title: '100% Private',
    desc: 'Your data never leaves your device. No servers, no tracking, no logs.',
  },
  {
    icon: '♾️',
    title: 'Truly Unlimited',
    desc: 'Generate as many QR codes as you need. Free forever, no account needed.',
  },
  {
    icon: '🖼️',
    title: 'High Quality',
    desc: 'Export crisp PNG up to 500 px or infinitely scalable vector SVG.',
  },
  {
    icon: '⚡',
    title: 'Real-time Preview',
    desc: 'See your QR code update live as you type — no waiting, no clicking.',
  },
]

export default function Features() {
  return (
    <section className="features">
      <div className="features-inner">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="feature-card">
            <div className="feature-icon">{icon}</div>
            <h4>{title}</h4>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
