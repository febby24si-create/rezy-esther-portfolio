import { createRoot } from "react-dom/client";
import './tailwind.css';
import WisataIndonesia from "./WisataIndonesia";
import WisataCard from "./WisataCard";
import WisataFilter from "./WisataFilter";
import WisataTable from "./WisataTable";


createRoot(document.getElementById("root"))
    .render(
        <div>
            {/* <FrameworkList/> */}
            <WisataIndonesia/>
            {/* <ResponsiveDesign/> */}
        </div>
)