import { StyledLink, LayoutProps } from "rakkasjs";
import css from "./layout.module.css";

export default function MainLayout({ children }: LayoutProps) {
  return (
    <div className={css.wrapper}>
      <div className={css.title}>
        <nav>
          <ul className={css.links}>
            <StyledLink href="/pokemon/pikachu" activeClass={css.activeLink}>
              Pikachu
            </StyledLink>
            <StyledLink href="/pokemon/charizard" activeClass={css.activeLink}>
              Charizard
            </StyledLink>
            <StyledLink href="/pokemon/onix" activeClass={css.activeLink}>
              Onix
            </StyledLink>
          </ul>
        </nav>
      </div>

      {children}
    </div>
  );
}
