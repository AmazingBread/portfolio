export function pageHeader(number, title, description, tags) {
  return (
    '<div class="page-heading"><p class="eyebrow">FEATURE LAB / ' +
    number +
    '</p><h1>' +
    title +
    '</h1><p>' +
    description +
    '</p><div class="tags">' +
    tags.map((tag) => '<span>' + tag + '</span>').join('') +
    '</div></div>'
  );
}
export function story(problem, approach, check) {
  return (
    '<section class="story-grid"><article><span>PROBLEM</span><h3>해결할 문제</h3><p>' +
    problem +
    '</p></article><article><span>APPROACH</span><h3>구현 방법</h3><p>' +
    approach +
    '</p></article><article><span>TRY IT</span><h3>확인해 보세요</h3><p>' +
    check +
    '</p></article></section>'
  );
}
