// app/page.tsx
// НИЧЕГО лишнего: без "use client", без хуков, только разметка
import Image from "next/image";
export default function Home() {
  return (
   

<div className="container">
  <div className="container_links">
  <div className="category_list">
    <div className="category_item">
    Нейросети
    </div>
  </div>

  <div className="inner_category">
    <div className="inner_category_item">
    Текст
    </div>
  </div>

  <div className="links_list">
    <div className="links_item">
    ChatGPT
    </div>
  </div>

  <div className="link_info">
    <div className="link_info_image">
    <img src="/cgpt.jpg" alt="ChatGPT" width={800} height={600} />
    </div>


    <h2 className="link_info_title">ChatGPT</h2>

<a href="https://chatgpt.com/" className="link_info_link"><span>https://chatgpt.com/</span> <Image src="/link.svg" alt="ChatGPT" width={20} height={20} priority /></a>

<div className="link_info_description">
ChatGPT — это нейросеть для общения и генерации текста, которая помогает формулировать мысли, писать статьи, создавать коды и сценарии диалогов. Её можно использовать как помощника в работе, учебе или творчестве, быстро получая ответы и новые идеи.
</div>
    
  </div>
</div>
</div>


  );
}
