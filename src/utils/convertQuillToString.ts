export const convertQuillToString = (text: any) => {
  if (typeof text !== "string") return "";
  const htmlString = text;

  // This function is intended to be run in browser environment
  if (typeof document === "undefined") return text;

  // Create a new div element
  const div = document.createElement("div");

  // Set the innerHTML of the div to the HTML string
  div.innerHTML = htmlString;

  // Tìm tất cả các thẻ math-inline và thay thế bằng nội dung LaTeX
  const mathInlineElements = div.querySelectorAll("math-inline");
  mathInlineElements.forEach((element) => {
    const latexContent =
      element.textContent || (element as HTMLElement).innerText;
    // Thay thế thẻ math-inline bằng nội dung LaTeX được bọc trong dấu $
    element.replaceWith(`$${latexContent}$`);
  });

  // Xử lý các thẻ <p> để tránh xuống dòng không mong muốn
  const paragraphElements = div.querySelectorAll("p");
  paragraphElements.forEach((element) => {
    // Nếu thẻ p chỉ chứa text đơn giản, thay thế bằng text content
    if (element.children.length === 0) {
      const textContent = element.textContent || element.innerText;
      element.replaceWith(textContent);
    }
  });

  // Lấy nội dung cuối cùng
  const processedContent = div.innerHTML;

  // Tạo div mới để lấy text content từ nội dung đã xử lý
  const finalDiv = document.createElement("div");
  finalDiv.innerHTML = processedContent;
  const finalText = finalDiv.textContent || finalDiv.innerText;

  return finalText;
};
