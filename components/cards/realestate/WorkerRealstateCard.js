import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Styles from '../../styles/WorkerRealstate.module.css';
import Stars from  '../../others/Stars';
import RealEstateShare from  './RealEstateShare'; 

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function WorkerRealstateCard(props) {

  const realstate = props.realstate;
  const slug = props.slug;

  return (
    <div className={Styles['worker-realstate-card-wrapper']} style={{
      background: "#fff",
      borderRadius: "12px",
      padding: "0",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      overflow: "hidden",
      direction: "rtl",
      textAlign: "right",
    }}>
      {/* Header with title */}
      <div style={{
        padding: "16px",
        borderBottom: "1px solid #f0f0f0",
      }}>
        <div style={{
          fontSize: "14px",
          color: "#888",
          fontWeight: "500",
          marginBottom: "8px",
        }}>
          لیست شده توسط
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          direction: "rtl",
        }}>
          <Avatar 
            alt={realstate.name + ' ' + realstate.family} 
            src={realstate.profile_url}
            sx={{ width: 50, height: 50 }}
          />
          <div>
            <div style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#222",
            }}>
              {realstate.name} {realstate.family}
            </div>
            <div style={{
              fontSize: "13px",
              color: "#0066cc",
              marginTop: "4px",
            }}>
              مشاهده صفحه اختصاصی
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div style={{
        display: "flex",
        gap: "12px",
        direction: "rtl",
        padding: "16px",
      }}>
        <a
          href={`tel:${realstate?.phone}`}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            textDecoration: "none",
            textAlign: "center",
            fontWeight: "600",
            color: "#222",
            fontSize: "16px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#0066cc";
            e.target.style.color = "#0066cc";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#ddd";
            e.target.style.color = "#222";
          }}
        >
          {realstate?.phone}
        </a>
        <button
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontWeight: "600",
            color: "#999",
            fontSize: "16px",
            cursor: "not-allowed",
            opacity: 0.6,
          }}
          disabled
        >
          چت (به زودی)
        </button>
      </div>
    </div>
  );
}
