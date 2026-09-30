try {
      await screen(root, ctx);
    } catch (e) {
      console.error('screen error:', e);
      root.innerHTML = `
        <div class="state" style="margin-top:40px">
          <div class="icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5M12 16.5v.01"/><circle cx="12" cy="12" r="9"/></svg>
          </div>
          <h3>حدث خطأ</h3>
          <p>${escHtml(e.message)}</p>
          <button class="btn btn-outline" id="retry-error-btn">إعادة المحاولة</button>
        </div>`;
      document.getElementById('retry-error-btn')?.addEventListener('click', () => location.reload());
    }