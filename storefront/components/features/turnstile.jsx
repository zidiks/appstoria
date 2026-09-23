import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import FormStatus from '~/components/features/form-status';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const TURNSTILE_LOAD_TIMEOUT = 12_000;

function loadTurnstileScript(callback, errorCallback) {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.turnstile) {
    callback();
    return;
  }

  const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);
  if (existingScript) {
    if (existingScript.dataset.loadFailed === 'true') {
      existingScript.remove();
      loadTurnstileScript(callback, errorCallback);
      return;
    }

    existingScript.addEventListener('load', callback, { once: true });
    existingScript.addEventListener('error', errorCallback, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = TURNSTILE_SCRIPT_ID;
  script.src =
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.addEventListener('load', callback, { once: true });
  script.addEventListener(
    'error',
    () => {
      script.dataset.loadFailed = 'true';
      errorCallback();
    },
    { once: true },
  );
  document.head.appendChild(script);
}

const TurnstileWidget = forwardRef(function TurnstileWidget(
  { className = '', onToken, onExpire, onError },
  ref,
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacksRef = useRef({ onToken, onExpire, onError });
  const siteKey = process.env.TURNSTILE_SITE_KEY;
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [status, setStatus] = useState(siteKey ? 'loading' : 'disabled');

  useEffect(() => {
    callbacksRef.current = { onToken, onExpire, onError };
  }, [onToken, onExpire, onError]);

  const retry = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.turnstile && widgetIdRef.current !== null) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    if (!window.turnstile) {
      document.getElementById(TURNSTILE_SCRIPT_ID)?.remove();
    }

    setStatus('loading');
    setLoadAttempt((value) => value + 1);
  };

  useImperativeHandle(ref, () => ({
    reset() {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
        setStatus('ready');
      }
    },
    retry,
  }));

  useEffect(() => {
    if (!siteKey) {
      return undefined;
    }

    let cancelled = false;
    setStatus('loading');
    const loadTimeout = window.setTimeout(() => {
      if (!cancelled && widgetIdRef.current === null) {
        setStatus('error');
        callbacksRef.current.onToken?.('');
        callbacksRef.current.onError?.();
      }
    }, TURNSTILE_LOAD_TIMEOUT);

    loadTurnstileScript(
      () => {
        if (
          cancelled ||
          !containerRef.current ||
          !window.turnstile ||
          widgetIdRef.current !== null
        ) {
          return;
        }

        window.clearTimeout(loadTimeout);
        setStatus('ready');
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: 'light',
            callback: (token) => {
              setStatus('verified');
              callbacksRef.current.onToken?.(token);
            },
            'expired-callback': () => {
              setStatus('ready');
              callbacksRef.current.onToken?.('');
              callbacksRef.current.onExpire?.();
            },
            'error-callback': () => {
              setStatus('error');
              callbacksRef.current.onToken?.('');
              callbacksRef.current.onError?.();
            },
          });
        } catch (error) {
          setStatus('error');
          callbacksRef.current.onToken?.('');
          callbacksRef.current.onError?.();
        }
      },
      () => {
        if (!cancelled) {
          window.clearTimeout(loadTimeout);
          setStatus('error');
          callbacksRef.current.onToken?.('');
          callbacksRef.current.onError?.();
        }
      },
    );

    return () => {
      cancelled = true;
      window.clearTimeout(loadTimeout);
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, loadAttempt]);

  if (!siteKey) {
    return null;
  }

  return (
    <div
      className={`turnstile-wrapper ${className}`}
      aria-busy={status === 'loading'}
    >
      <div className="turnstile-widget-slot">
        <div ref={containerRef} />
        {status === 'loading' ? (
          <FormStatus
            type="loading"
            message="Загрузка проверки безопасности…"
            reserveSpace={false}
          />
        ) : null}
      </div>
      <div className="turnstile-status-slot">
        {status === 'ready' ? (
          <FormStatus
            type="info"
            message="Завершите проверку безопасности."
            reserveSpace={false}
          />
        ) : null}
        {status === 'verified' ? (
          <FormStatus
            type="success"
            message="Проверка безопасности пройдена."
            reserveSpace={false}
          />
        ) : null}
        {status === 'error' ? (
          <div className="turnstile-error" role="alert">
            <FormStatus
              type="error"
              message="Не удалось загрузить проверку безопасности. Проверьте интернет, VPN или блокировщик рекламы."
              reserveSpace={false}
            />
            <button
              type="button"
              className="btn btn-link turnstile-retry"
              onClick={retry}
            >
              Повторить загрузку
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default TurnstileWidget;
