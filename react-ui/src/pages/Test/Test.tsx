import { getRemoteMenu } from "@/services/session";
import { useAppData, useLocation, useParams } from "@umijs/max";


const Renderer = (props) => {
  const { page } = props;
  const params = useParams();
  const { pathname } = useLocation();
  let menu = getRemoteMenu();
  let data2 =  useAppData()

  return (
    <div className="lowcode-plugin-sample-preview" style={{ minHeight: '90vh' }}>
      testpage
    </div>
  );
};

export default Renderer;
