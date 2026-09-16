export function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  return isMobileUA || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

export function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

export function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

export function getDevicePixelRatio() {
  return window.devicePixelRatio || 1;
}
