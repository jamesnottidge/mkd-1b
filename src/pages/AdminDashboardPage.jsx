import React, { useEffect, useState, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import MkdSDK from "../utils/MkdSDK";
import { FaArrowUp } from "react-icons/fa";
import { SlUser } from "react-icons/sl";
import { Img } from "react-image";
import { MyImageLoader } from "../components/MyImageLoader";
import { AuthContext } from "../authContext";
import { useNavigate } from "react-router";
import { useDrag, useDrop } from "react-dnd";
import update from "immutability-helper";

const AdminDashboardPage = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sdk = new MkdSDK();
  const navigate = useNavigate();
  const { state, dispatch } = React.useContext(AuthContext);

  const handleLogout = () => {
    dispatch({
      type: "LOGOUT",
    });
    navigate("/admin/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        sdk.setTable("video");
        const response = await sdk.callRestAPI(
          { page: page, limit: 10 },
          "PAGINATE"
        );
        setData(response.list);
        console.log(response.list);
        setTotalPages(response.num_pages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const moveVideo = (dragIndex, hoverIndex) => {
    const draggedVideo = data[dragIndex];
    setData(
      update(data, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, draggedVideo],
        ],
      })
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#111111]">
        <div className="text-4xl font-bold text-blue-500">
          <span className="animate-pulse">m</span>
          <span className="animate-pulse mx-2">k</span>
          <span className="animate-pulse">d</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-4xl font-bold text-red-500">
          <svg
            className="animate-shake h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="ml-2">Oops! Something went wrong.</span>
        </div>
      </div>
    );

  return (
    <div className="bg-[#111111]">
      <div className="container mx-auto p-4">
        <div className="mb-12 flex justify-between">
          <h1 className="text-white text-4xl font-bold">APP</h1>
          <button
            className="bg-[#9BFF00]  py-2 px-4 flex items-center rounded-full"
            onClick={handleLogout}
          >
            <SlUser className="mr-2" />
            Logout
          </button>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center">
            <h2 className="text-gray-200 text-3xl font-thin ">
              Today's leaderboard
            </h2>
          </div>
          <div className="bg-[#1D1D1D] flex justify-between rounded-md py-2 px-3">
            <div className="flex items-center justify-center text-xs text-white text-opacity-10 ">
              30 May 2022.
            </div>
            <div className="flex bg-[#9BFF00] items-center rounded-md m-2 p-1 text-xs px-2 text-opacity-20">
              SUBMISSIONS OPEN
            </div>
            <div className="flex items-center justify-end pr-1 text-xs text-white text-opacity-10">
              . 11:34
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate  border-spacing-y-4 border-spacing-x-0 ">
            <thead>
              <tr className=" text-gray-600 text-sm font-thin leading-normal">
                <th className="py-3 px-6 text-left">#</th>
                <th className="py-3 px-6 text-left">Title</th>
                <th className="py-3 px-6 text-left">Author</th>
                <th className="py-3 px-6 text-right">Likes</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              <DndProvider backend={HTML5Backend}>
                {data.map((video, index) => (
                  <Video
                    key={video.id}
                    index={index}
                    video={video}
                    moveVideo={moveVideo}
                  />
                ))}
              </DndProvider>
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="bg-[#9BFF00] text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="bg-[#9BFF00]  text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

function Video({ video, index, moveVideo }) {
  const type = "Video";
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: type,
    hover(item) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveVideo(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag(() => ({
    type: type,
    item: { id: video.id, index },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  }));
  drag(drop(ref));
  return (
    <tr
      className={` ${
        isDragging ? "opacity-10" : "opacity-100"
      } border border-white rounded-md hover:cursor-pointer my-2`}
      ref={ref}
    >
      <td className="py-3 px-6 text-left border-y border-l border-white border-opacity-10 rounded-l-lg">
        {video.id}
      </td>
      <td className="py-3 px-6 text-left border-y border-white border-opacity-10">
        <div className="flex items-center">
          <Img
            src={[video.photo, "https://picsum.photos/200/200"]}
            alt={video.title}
            loader={<MyImageLoader />}
            className="w-30 h-16 mr-4 object-cover"
          />
          <span className="text-lg">{video.title}</span>
        </div>
      </td>
      <td className="py-3 px-6 text-left border-y border-white border-opacity-10 ">
        <div className="flex items-center">
          <img
            src={`https://i.pravatar.cc/150?img=${video.user_id}`}
            alt={video.username}
            className="w-8 h-8 rounded-full mr-4"
          />
          <span className="text-green-300 text-xs font-thin">
            {video.username}
          </span>
        </div>
      </td>
      <td className="py-3 px-6 text-right border-y border-r border-white border-opacity-10 rounded-r-lg ">
        <div className="flex items-center justify-end gap-2">
          <span>{video.like}</span>
          <FaArrowUp className="text-green-300 mr-2" />
        </div>
      </td>
    </tr>
  );
}

export default AdminDashboardPage;
