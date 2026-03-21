import { useClientStoreState } from "../../state/storeContext";

export function AppFooter() {
  const state = useClientStoreState();

  const primaryText = state.footer?.primaryText ?? "";
  const secondaryText = state.footer?.secondaryText;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-line">
          <span className="footer-primary">{primaryText}</span>

          {secondaryText ? (
            <>
              <span className="footer-separator">•</span>
              <span className="footer-secondary">{secondaryText}</span>
            </>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
