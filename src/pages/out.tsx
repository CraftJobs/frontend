import { useLocation } from "react-router"
import { Link } from "react-router-dom";

export default function OutPage() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    let dest = query.get('u') || 'https://craftjobs.net';
    let from = query.get('f') || '/';

    if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
        dest = 'https://craftjobs.net';
    }

    return <div>
        <div className='container mx-auto lg:px-96 dark:text-gray-300'>
        <figure className="dark:bg-gray-700 bg-gray-100 rounded-xl mt-9 ml-9 shadow pl-3 pt-2 pb-3">
        <h1 className="text-2xl">External Link</h1>
        <br />
        <p>
            Be careful! This link is taking you out of CraftJobs. Please ensure you trust this 
            link.
        </p>
        <p>Destination: <b>{dest}</b></p>
        <br />
        <a href={dest} className="hover:underline"><b>Continue to external link</b></a> |{' '}
        <Link to={'/i/r?r=' + encodeURIComponent(from)} className="hover:underline"><b>Go back</b></Link>
        </figure>
        </div>
    </div>
}