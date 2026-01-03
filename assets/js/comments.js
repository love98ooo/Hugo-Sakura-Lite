/**
 * Comments System for Sakura Theme
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', initComments);

  function initComments() {
    const commentsSection = document.getElementById('comments');
    if (!commentsSection) return;

    const apiUrl = commentsSection.dataset.apiUrl;
    const postSlug = commentsSection.dataset.postSlug;
    const turnstileSiteKey = commentsSection.dataset.turnstileSitekey;

    // DOM Elements
    const authGuest = document.getElementById('authGuest');
    const authUser = document.getElementById('authUser');
    const commentsForm = document.getElementById('commentsForm');
    const commentsLoading = document.getElementById('commentsLoading');
    const commentsEmpty = document.getElementById('commentsEmpty');
    const commentsContainer = document.getElementById('commentsContainer');
    const commentsCount = document.getElementById('commentsCount');
    const formUserName = document.getElementById('formUserName');

    // OTP Elements
    const otpForm = document.getElementById('otpForm');
    const otpEmail = document.getElementById('otpEmail');
    const otpDisplayName = document.getElementById('otpDisplayName');
    const otpCodeGroup = document.getElementById('otpCodeGroup');
    const otpCode = document.getElementById('otpCode');
    const otpSubmit = document.getElementById('otpSubmit');
    const otpBtnText = document.getElementById('otpBtnText');
    const otpResend = document.getElementById('otpResend');

    // User Elements
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const logoutBtn = document.getElementById('logoutBtn');
    const githubLogin = document.getElementById('githubLogin');

    // Comment Form Elements
    const commentForm = document.getElementById('commentForm');
    const commentContent = document.getElementById('commentContent');
    const submitComment = document.getElementById('submitComment');

    // State
    let currentUser = null;
    let authToken = localStorage.getItem('comments_token');
    let otpSent = false;
    let resendTimer = null;
    let turnstileWidgetId = null;
    let turnstileToken = null;

    // Check if running on localhost
    function isLocalhost() {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    }

    // Toast notification system
    let toastContainer = null;

    function showToast(message, type = 'info') {
      // Create container if not exists
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
      }

      const icons = {
        success: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
        error: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
        info: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
      };

      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
      `;

      toastContainer.appendChild(toast);

      // Auto remove after 3 seconds
      setTimeout(() => {
        toast.classList.add('toast--leaving');
        setTimeout(() => {
          toast.remove();
        }, 200);
      }, 3000);
    }

    // Initialize
    init();

    async function init() {
      handleGitHubCallback();
      await checkAuth();
      await loadComments();
      initTurnstile();
    }

    // Initialize Turnstile widget
    function initTurnstile() {
      // Skip Turnstile on localhost
      if (isLocalhost()) {
        const container = document.getElementById('turnstileWidget');
        if (container) {
          container.style.display = 'none';
        }
        return;
      }

      if (!turnstileSiteKey || typeof turnstile === 'undefined') {
        // Wait for Turnstile to load
        if (turnstileSiteKey && typeof turnstile === 'undefined') {
          setTimeout(initTurnstile, 100);
        }
        return;
      }

      const container = document.getElementById('turnstileWidget');
      if (!container) return;

      turnstileWidgetId = turnstile.render(container, {
        sitekey: turnstileSiteKey,
        theme: 'auto',
        size: 'flexible',
        callback: function(token) {
          turnstileToken = token;
        },
        'expired-callback': function() {
          turnstileToken = null;
        },
        'error-callback': function() {
          turnstileToken = null;
        }
      });
    }

    function resetTurnstile() {
      if (turnstileWidgetId !== null && typeof turnstile !== 'undefined') {
        turnstile.reset(turnstileWidgetId);
        turnstileToken = null;
      }
    }

    // Check authentication status
    async function checkAuth() {
      if (!authToken) {
        showGuestUI();
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/me`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          currentUser = data.user;
          showUserUI();
        } else {
          localStorage.removeItem('comments_token');
          authToken = null;
          showGuestUI();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        showGuestUI();
      }
    }

    function showGuestUI() {
      authGuest.style.display = 'block';
      commentsForm.style.display = 'none';
    }

    function showUserUI() {
      authGuest.style.display = 'none';
      commentsForm.style.display = 'block';

      // Update form user info
      if (formUserName) {
        formUserName.textContent = currentUser.displayName;
      }
      // Hidden auth-user for data storage
      if (userAvatar) {
        userAvatar.src = currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName)}&background=random`;
      }
      if (userName) {
        userName.textContent = currentUser.displayName;
      }
      if (userEmail) {
        userEmail.textContent = currentUser.email;
      }
    }

    // OTP Login Flow
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!otpSent) {
        await sendOTP();
      } else {
        await verifyOTP();
      }
    });

    async function sendOTP() {
      const email = otpEmail.value.trim();
      const displayName = otpDisplayName.value.trim();

      if (!email) return;

      // Check Turnstile token (skip on localhost)
      if (!isLocalhost() && turnstileSiteKey && !turnstileToken) {
        showToast('请完成人机验证', 'error');
        return;
      }

      otpSubmit.disabled = true;
      otpBtnText.textContent = '发送中...';

      try {
        const requestBody = { email, displayName };
        if (turnstileToken) {
          requestBody.turnstileToken = turnstileToken;
        }

        const response = await fetch(`${apiUrl}/auth/otp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
          otpSent = true;
          otpCodeGroup.style.display = 'flex';
          otpEmail.disabled = true;
          otpDisplayName.disabled = true;
          otpBtnText.textContent = '验证登录';
          otpCode.focus();
          startResendTimer();
          // Hide Turnstile after successful OTP send
          const turnstileContainer = document.getElementById('turnstileWidget');
          if (turnstileContainer) {
            turnstileContainer.style.display = 'none';
          }
        } else {
          showToast(data.error || '发送验证码失败', 'error');
          resetTurnstile();
        }
      } catch (error) {
        console.error('Send OTP failed:', error);
        showToast('网络错误，请重试', 'error');
        resetTurnstile();
      } finally {
        otpSubmit.disabled = false;
      }
    }

    async function verifyOTP() {
      const email = otpEmail.value.trim();
      const code = otpCode.value.trim();
      const displayName = otpDisplayName.value.trim();

      if (!email || !code) return;

      otpSubmit.disabled = true;
      otpBtnText.textContent = '验证中...';

      try {
        const response = await fetch(`${apiUrl}/auth/otp/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, code, displayName })
        });

        const data = await response.json();

        if (response.ok) {
          authToken = data.token;
          currentUser = data.user;
          localStorage.setItem('comments_token', authToken);
          showUserUI();
          resetOTPForm();
        } else {
          showToast(data.error || '验证码错误', 'error');
          otpSubmit.disabled = false;
          otpBtnText.textContent = '验证登录';
        }
      } catch (error) {
        console.error('Verify OTP failed:', error);
        showToast('网络错误，请重试', 'error');
        otpSubmit.disabled = false;
        otpBtnText.textContent = '验证登录';
      }
    }

    function resetOTPForm() {
      otpSent = false;
      otpEmail.value = '';
      otpEmail.disabled = false;
      otpDisplayName.value = '';
      otpDisplayName.disabled = false;
      otpCode.value = '';
      otpCodeGroup.style.display = 'none';
      otpBtnText.textContent = '发送验证码';
      otpSubmit.disabled = false;
      clearResendTimer();
      // Reset and show Turnstile
      const turnstileContainer = document.getElementById('turnstileWidget');
      if (turnstileContainer) {
        turnstileContainer.style.display = 'block';
      }
      resetTurnstile();
    }

    function startResendTimer() {
      let seconds = 60;
      otpResend.disabled = true;
      otpResend.textContent = `${seconds}s`;

      resendTimer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearResendTimer();
          otpResend.disabled = false;
          otpResend.textContent = '重新发送';
        } else {
          otpResend.textContent = `${seconds}s`;
        }
      }, 1000);
    }

    function clearResendTimer() {
      if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
      }
    }

    otpResend.addEventListener('click', async () => {
      if (otpResend.disabled) return;

      const email = otpEmail.value.trim();
      const displayName = otpDisplayName.value.trim();

      // Show and reset Turnstile for resend (skip on localhost)
      const turnstileContainer = document.getElementById('turnstileWidget');
      if (!isLocalhost() && turnstileContainer && turnstileSiteKey) {
        turnstileContainer.style.display = 'block';
        resetTurnstile();
        // Wait for user to complete Turnstile
        showToast('请完成人机验证后重新发送', 'info');
        return;
      }

      otpResend.disabled = true;
      otpResend.textContent = '发送中...';

      try {
        const requestBody = { email, displayName };
        if (turnstileToken) {
          requestBody.turnstileToken = turnstileToken;
        }

        const response = await fetch(`${apiUrl}/auth/otp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          startResendTimer();
          // Hide Turnstile after successful resend
          if (turnstileContainer) {
            turnstileContainer.style.display = 'none';
          }
        } else {
          const data = await response.json();
          showToast(data.error || '发送失败', 'error');
          otpResend.disabled = false;
          otpResend.textContent = '重新发送';
          resetTurnstile();
        }
      } catch (error) {
        console.error('Resend OTP failed:', error);
        showToast('网络错误', 'error');
        otpResend.disabled = false;
        otpResend.textContent = '重新发送';
        resetTurnstile();
      }
    });

    // GitHub OAuth
    githubLogin.addEventListener('click', () => {
      localStorage.setItem('comments_redirect', window.location.href);
      window.location.href = `${apiUrl}/auth/github/login?redirect=${encodeURIComponent(window.location.href)}`;
    });

    function handleGitHubCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        authToken = token;
        localStorage.setItem('comments_token', token);

        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        checkAuth();
      }
    }

    // Logout
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('comments_token');
      authToken = null;
      currentUser = null;
      showGuestUI();
    });

    // Load Comments
    async function loadComments() {
      try {
        const response = await fetch(`${apiUrl}/comments?slug=${encodeURIComponent(postSlug)}`);
        const data = await response.json();

        commentsLoading.style.display = 'none';

        if (response.ok && data.comments && data.comments.length > 0) {
          // Show comments count
          if (commentsCount) {
            commentsCount.textContent = `${data.comments.length} 条评论`;
            commentsCount.style.display = 'block';
          }
          renderComments(data.comments);
          commentsContainer.style.display = 'block';
        } else {
          commentsEmpty.style.display = 'flex';
        }
      } catch (error) {
        console.error('Load comments failed:', error);
        commentsLoading.style.display = 'none';
        commentsEmpty.style.display = 'flex';
        commentsEmpty.querySelector('p').textContent = '加载评论失败，请刷新重试';
      }
    }

    function renderComments(comments) {
      // Flat rendering - no tree structure, just show reply indicator if replyToUserId exists
      commentsContainer.innerHTML = comments.map(comment => renderComment(comment)).join('');

      // Bind reply buttons
      bindReplyButtons();
    }

    function bindReplyButtons() {
      commentsContainer.querySelectorAll('.comment-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const userId = parseInt(btn.dataset.userId);
          const userName = btn.dataset.userName;
          const commentItem = btn.closest('.comment-item');
          showInlineReplyForm(commentItem, userId, userName);
        });
      });
    }

    function showInlineReplyForm(commentItem, userId, userName) {
      // Remove any existing inline reply forms
      const existingForm = commentsContainer.querySelector('.inline-reply-form');
      if (existingForm) {
        existingForm.remove();
      }

      // Create inline reply form
      const replyForm = document.createElement('div');
      replyForm.className = 'inline-reply-form';
      replyForm.innerHTML = `
        <div class="inline-reply-header">
          <span>回复 <strong>${escapeHtml(userName)}</strong></span>
          <button type="button" class="inline-reply-cancel">取消</button>
        </div>
        <textarea class="inline-reply-textarea" placeholder="写下你的回复..." required></textarea>
        <div class="inline-reply-actions">
          <button type="button" class="inline-reply-submit">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            发送回复
          </button>
        </div>
      `;

      // Insert after comment-actions
      const actionsEl = commentItem.querySelector('.comment-actions');
      actionsEl.after(replyForm);

      // Focus on textarea
      const textarea = replyForm.querySelector('.inline-reply-textarea');
      textarea.focus();

      // Bind cancel button
      replyForm.querySelector('.inline-reply-cancel').addEventListener('click', () => {
        replyForm.remove();
      });

      // Bind submit button
      replyForm.querySelector('.inline-reply-submit').addEventListener('click', async () => {
        const content = textarea.value.trim();
        if (!content) return;

        const submitBtn = replyForm.querySelector('.inline-reply-submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
          提交中...
        `;

        try {
          const response = await fetch(`${apiUrl}/comments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              postSlug,
              content,
              replyToUserId: userId
            })
          });

          const data = await response.json();

          if (response.ok) {
            replyForm.remove();

            // Reload comments
            commentsEmpty.style.display = 'none';
            commentsContainer.style.display = 'none';
            commentsLoading.style.display = 'flex';
            await loadComments();

            if (data.comment.status === 'pending') {
              showToast('回复已提交，待审核后显示', 'success');
            }
          } else {
            showToast(data.error || '回复失败', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
              发送回复
            `;
          }
        } catch (error) {
          console.error('Submit reply failed:', error);
          showToast('网络错误，请重试', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            发送回复
          `;
        }
      });
    }

    function renderComment(comment) {
      const avatarUrl = comment.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.displayName)}&background=random&size=80`;
      const isAdmin = comment.user.isAdmin;
      const timeAgo = formatTimeAgo(new Date(comment.createdAt));

      // Reply indicator - show if this comment is a reply to someone
      const replyIndicator = comment.replyToUser ? `
        <div class="comment-reply-to">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
          <span class="reply-name">${escapeHtml(comment.replyToUser.displayName)}</span>
        </div>
      ` : '';

      return `
        <div class="comment-item ${comment.status === 'pending' ? 'comment-pending' : ''}">
          <img class="comment-avatar" src="${avatarUrl}" alt="${escapeHtml(comment.user.displayName)}" loading="lazy">
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-author ${isAdmin ? 'is-admin' : ''}">${escapeHtml(comment.user.displayName)}</span>
              <span class="comment-time">${timeAgo}</span>
            </div>
            ${replyIndicator}
            <div class="comment-content">${renderMarkdown(comment.content)}</div>
            ${currentUser ? `
              <div class="comment-actions">
                <button class="comment-reply-btn" data-user-id="${comment.user.id}" data-user-name="${escapeHtml(comment.user.displayName)}">
                  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
                  回复
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }


    // Submit Comment (for new top-level comments only)
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const content = commentContent.value.trim();
      if (!content) return;

      submitComment.disabled = true;
      const originalText = submitComment.textContent;
      submitComment.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
        提交中...
      `;

      try {
        const response = await fetch(`${apiUrl}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            postSlug,
            content
          })
        });

        const data = await response.json();

        if (response.ok) {
          commentContent.value = '';

          commentsEmpty.style.display = 'none';
          commentsContainer.style.display = 'none';
          commentsLoading.style.display = 'flex';
          await loadComments();

          if (data.comment.status === 'pending') {
            showToast('评论已提交，待审核后显示', 'success');
          }
        } else {
          showToast(data.error || '发表评论失败', 'error');
        }
      } catch (error) {
        console.error('Submit comment failed:', error);
        showToast('网络错误，请重试', 'error');
      } finally {
        submitComment.disabled = false;
        submitComment.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
          提交评论
        `;
      }
    });

    // Utility Functions
    function formatTimeAgo(date) {
      const now = new Date();
      const diff = now - date;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      if (years > 0) return `${years} 年前`;
      if (months > 0) return `${months} 个月前`;
      if (days > 0) return `${days} 天前`;
      if (hours > 0) return `${hours} 小时前`;
      if (minutes > 0) return `${minutes} 分钟前`;
      return '刚刚';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function renderMarkdown(text) {
      let html = escapeHtml(text);

      // Code blocks
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

      // Bold
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // Italic
      html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Links
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

      // Line breaks
      html = html.replace(/\n/g, '<br>');

      return `<p>${html}</p>`;
    }
  }
})();

