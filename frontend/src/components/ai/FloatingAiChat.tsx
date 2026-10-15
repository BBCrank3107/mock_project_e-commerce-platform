import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Stack,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Fade,
  Slide,
  Divider,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../../api/aiApi';
import type { ChatResponse, ProductSummary } from '../../api/aiApi';
import { useCart } from '../../features/cart_checkout/CartContext';
import { money } from '../../features/cart_checkout/transactionApi';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  products?: ProductSummary[];
  time: string;
}

const MessageContent: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (isUser) {
    return <Box sx={{ whiteSpace: 'pre-wrap' }}>{text}</Box>;
  }

  // Parse markdown lines for Bot response
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  const parseInline = (str: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    // Match bold **text**, italic *text* or _text_, code `text`
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(str.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <Box component="strong" key={`b-${match.index}`} sx={{ fontWeight: 650, color: '#0F172A' }}>
            {token.slice(2, -2)}
          </Box>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <Box component="em" key={`i-${match.index}`} sx={{ fontStyle: 'italic' }}>
            {token.slice(1, -1)}
          </Box>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <Box
            component="code"
            key={`c-${match.index}`}
            sx={{
              bgcolor: '#F1F5F9',
              px: 0.6,
              py: 0.2,
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: '0.82em',
              color: '#0F172A',
            }}
          >
            {token.slice(1, -1)}
          </Box>
        );
      }
      lastIdx = regex.lastIndex;
    }
    if (lastIdx < str.length) {
      parts.push(str.substring(lastIdx));
    }
    return parts.length > 0 ? parts : [str];
  };

  let tableRows: string[][] = [];

  const flushTable = (key: number) => {
    if (tableRows.length === 0) return null;
    const rows = [...tableRows];
    tableRows = [];
    return (
      <Box
        key={`table-${key}`}
        sx={{
          my: 1.2,
          border: '1px solid #CBD5E1',
          borderRadius: 2,
          overflow: 'hidden',
          fontSize: '0.78rem',
          bgcolor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {rows.map((row, rIdx) => {
          const isHeader = rIdx === 0;
          return (
            <Box
              key={rIdx}
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${row.length}, 1fr)`,
                p: 0.9,
                bgcolor: isHeader ? '#F1F5F9' : rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                borderBottom: rIdx < rows.length - 1 ? '1px solid #E2E8F0' : 'none',
                fontWeight: isHeader ? 700 : 400,
                alignItems: 'center',
              }}
            >
              {row.map((cell, cIdx) => (
                <Box key={cIdx} sx={{ px: 0.5 }}>
                  {parseInline(cell.trim())}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    );
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Markdown Table row: | col1 | col2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) {
        // Divider row in markdown table, ignore
        return;
      }
      const cells = trimmed
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.length > 0) {
        tableRows.push(cells);
        return;
      }
    } else if (tableRows.length > 0) {
      const tableElem = flushTable(index);
      if (tableElem) elements.push(tableElem);
    }

    if (!trimmed) {
      // Line break
      elements.push(<Box key={`br-${index}`} sx={{ height: 6 }} />);
      return;
    }

    // Horizontal Rule: ---, ***, ___
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(<Divider key={`hr-${index}`} sx={{ my: 1.2, borderColor: '#CBD5E1' }} />);
      return;
    }

    // Markdown Headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const headingLevel = headingMatch[1].length;
      const headingText = headingMatch[2];
      elements.push(
        <Typography
          key={`h-${index}`}
          variant="subtitle2"
          sx={{
            fontWeight: 750,
            fontSize: headingLevel <= 2 ? '0.925rem' : '0.85rem',
            color: '#0F172A',
            mt: 1.2,
            mb: 0.4,
          }}
        >
          {parseInline(headingText)}
        </Typography>
      );
      return;
    }

    // Markdown Bullet Points: * item, - item, • item, or numbered list 1. item
    const bulletMatch = trimmed.match(/^([*\-•]|\d+\.)\s+(.*)$/);
    if (bulletMatch) {
      const bulletPrefix = bulletMatch[1];
      const bulletContent = bulletMatch[2];
      const isNumber = /^\d+\.$/.test(bulletPrefix);

      elements.push(
        <Box key={`b-${index}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8, my: 0.35, pl: 0.5 }}>
          <Box
            component="span"
            sx={{
              color: '#2563EB',
              fontWeight: 700,
              fontSize: isNumber ? '0.8rem' : '1.1rem',
              lineHeight: 1.35,
              minWidth: isNumber ? 18 : 10,
              userSelect: 'none',
            }}
          >
            {isNumber ? bulletPrefix : '•'}
          </Box>
          <Typography
            component="div"
            variant="body2"
            sx={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.55, color: '#1E293B' }}
          >
            {parseInline(bulletContent)}
          </Typography>
        </Box>
      );
      return;
    }

    // Regular line
    elements.push(
      <Typography
        key={`p-${index}`}
        component="div"
        variant="body2"
        sx={{ fontSize: '0.85rem', lineHeight: 1.55, my: 0.2, color: '#1E293B' }}
      >
        {parseInline(trimmed)}
      </Typography>
    );
  });

  if (tableRows.length > 0) {
    const tableElem = flushTable(lines.length);
    if (tableElem) elements.push(tableElem);
  }

  return <Box>{elements}</Box>;
};

export function FloatingAiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { add } = useCart();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Dạ em chào anh/chị! Em là Trợ lý AI của CyberTech Store 🤖. Em có thể tư vấn sản phẩm theo ngân sách, gợi ý cấu hình và giải đáp chính sách mua hàng. Anh/chị cần em hỗ trợ gì ạ?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    aiApi.getSuggestions().then((sugs) => {
      if (sugs && sugs.length > 0) setSuggestions(sugs);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res: ChatResponse = await aiApi.chat(textToSend);
      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: res.reply,
        products: res.recommendedProducts,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (res.suggestedQuestions && res.suggestedQuestions.length > 0) {
        setSuggestions(res.suggestedQuestions);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          sender: 'bot',
          text: 'Dạ em gặp chút gián đoạn kết nối. Anh/chị vui lòng thử lại sau giây lát nhé ạ!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleAddToCart = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await add(productId, 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
      {/* Floating Action Button */}
      {!open && (
        <Fade in={!open}>
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2.5,
              py: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 30px rgba(37, 99, 235, 0.5)',
              },
            }}
          >
            <AutoAwesomeIcon sx={{ mr: 1, fontSize: 20 }} />
            Tư vấn AI
          </Fab>
        </Fade>
      )}

      {/* Chat Window */}
      {open && (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          <Paper
            elevation={16}
            sx={{
              width: { xs: 'calc(100vw - 32px)', sm: 390 },
              height: 560,
              maxHeight: 'calc(100vh - 100px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.25)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 38,
                    height: 38,
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  }}
                >
                  <SmartToyIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Trợ lý AI CyberTech
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A7F3D0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 7, height: 7, bgcolor: '#10B981', borderRadius: '50%' }} />
                    Sẵn sàng tư vấn (RAG Engine)
                  </Typography>
                </Box>
              </Stack>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#94A3B8', '&:hover': { color: '#ffffff' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Message Body */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                bgcolor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {messages.map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      maxWidth: '85%',
                      borderRadius: 2.5,
                      borderTopRightRadius: m.sender === 'user' ? 0.5 : 2.5,
                      borderTopLeftRadius: m.sender === 'bot' ? 0.5 : 2.5,
                      bgcolor: m.sender === 'user' ? '#2563EB' : '#FFFFFF',
                      color: m.sender === 'user' ? '#FFFFFF' : '#1E293B',
                      border: m.sender === 'bot' ? '1px solid #E2E8F0' : 'none',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <MessageContent text={m.text} isUser={m.sender === 'user'} />
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 0.5, fontSize: '0.675rem' }}>
                    {m.time}
                  </Typography>

                  {/* Recommended Products Cards */}
                  {m.products && m.products.length > 0 && (
                    <Stack spacing={1} sx={{ mt: 1, width: '100%', maxWidth: '95%' }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        SẢN PHẨM GỢI Ý PHÙ HỢP:
                      </Typography>
                      {m.products.map((p) => (
                        <Card
                          key={p.id}
                          variant="outlined"
                          sx={{
                            display: 'flex',
                            p: 1,
                            borderRadius: 2,
                            borderColor: '#E2E8F0',
                            bgcolor: '#FFFFFF',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            },
                          }}
                        >
                          <CardMedia
                            component="img"
                            sx={{ width: 60, height: 60, borderRadius: 1.5, objectFit: 'cover' }}
                            image={p.thumbnailUrl || 'https://placehold.co/100x100?text=Product'}
                            alt={p.name}
                          />
                          <CardContent sx={{ flex: 1, p: '4px 8px !important' }}>
                            <Typography variant="body2" fontWeight={600} noWrap title={p.name}>
                              {p.name}
                            </Typography>
                            <Typography variant="caption" color="primary.main" fontWeight={700} display="block">
                              {money(p.discountPrice || p.price)}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              <Button
                                size="small"
                                variant="text"
                                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                                onClick={() => navigate(`/products/${p.id}`)}
                                sx={{ fontSize: '0.7rem', p: 0 }}
                              >
                                Xem
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddShoppingCartIcon sx={{ fontSize: 13 }} />}
                                onClick={(e) => void handleAddToCart(p.id, e)}
                                sx={{ fontSize: '0.7rem', py: 0.2, px: 0.8 }}
                              >
                                + Giỏ
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}

              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Trợ lý AI đang tra cứu kho hàng...
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Suggested Chips Bar */}
            {suggestions.length > 0 && !loading && (
              <Box sx={{ p: 1, bgcolor: '#FFFFFF', borderTop: '1px solid #F1F5F9', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <Stack direction="row" spacing={0.8}>
                  {suggestions.slice(0, 3).map((sug, idx) => (
                    <Chip
                      key={idx}
                      label={sug}
                      size="small"
                      onClick={() => void handleSend(sug)}
                      sx={{
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        bgcolor: '#EFF6FF',
                        color: '#1D4ED8',
                        '&:hover': { bgcolor: '#DBEAFE' },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Input Bar */}
            <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Hỏi về sản phẩm, giá, chính sách..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || loading}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Paper>
        </Slide>
      )}
    </Box>
  );
}
