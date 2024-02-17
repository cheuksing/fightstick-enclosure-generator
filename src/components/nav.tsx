import {Link} from 'wouter';

export function Nav() {
  return (
    <nav className='container-fluid'>
      <ul>
        <li><strong>Fightstick Enclosure Generator</strong></li>
      </ul>
      <ul className='flex-no-shrink'>
        <li>
          <Link href='/guides/guide'>Guide</Link>
        </li>
        <li>
          <a href='https://github.com/cheuksing/fightstick-enclosure-generator' target='_blank'>
            <img width={36} height={36} className='github-icon' src='/github-mark-white.svg' />
          </a>
        </li>
      </ul>
    </nav>
  );
}

