import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {client} from './client';
import {listGuestPhotos,deleteGuestPhoto} from './photo-library';
import './style.css';
import './admin-type.css';
function Preview({path}){
 const [url,setUrl]=useState(''),[failed,setFailed]=useState(false);
 useEffect(()=>{let active=true,objectUrl;client.storage.from('wedding-guests').download(path).then(({data,error})=>{if(!active)return;if(error){setFailed(true);return}objectUrl=URL.createObjectURL(data);setUrl(objectUrl)}).catch(()=>{if(active)setFailed(true)});return()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl)}},[path]);
 return <div className="photo-preview">{url?<img src={url} alt="전달받은 사진 미리보기"/>:<span>{failed?'미리보기 불가':'불러오는 중'}</span>}</div>
}
function Admin(){
 const [session,setSession]=useState(null),[allowed,setAllowed]=useState(false),[status,setStatus]=useState(''),[items,setItems]=useState([]),[busy,setBusy]=useState(false);
 const [query,setQuery]=useState(''),[page,setPage]=useState(1),[pageSize,setPageSize]=useState(20);
 const filtered=items.filter(item=>item.path.toLowerCase().includes(query.trim().toLowerCase()));
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
 const currentPage=Math.min(page,pages);
 const visible=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
 useEffect(()=>{setPage(current=>Math.min(current,pages))},[pages]);
 useEffect(()=>{if(!client)return;client.auth.getSession().then(({data})=>setSession(data.session));const {data}=client.auth.onAuthStateChange((_e,s)=>{setSession(s);setAllowed(false);setItems([])});return()=>data.subscription.unsubscribe()},[]);
 useEffect(()=>{let valid=true;if(session)client.from('wedding_admins').select('user_id').eq('user_id',session.user.id).then(({data,error})=>{if(valid){setAllowed(!error&&data?.length===1);setStatus(error||!data?.length?'관리자로 등록된 계정만 열람할 수 있습니다.':'')}});return()=>{valid=false}},[session]);
 useEffect(()=>{if(allowed)load()},[allowed]);
 async function login(e){e.preventDefault();setBusy(true);const f=new FormData(e.target);const {error}=await client.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});setStatus(error?'로그인하지 못했습니다. 계정 정보를 확인해 주세요.':'');setBusy(false)}
 async function load(){setBusy(true);try{const all=await listGuestPhotos(client.storage.from('wedding-guests'));setItems(all);setPage(1);setStatus(`${all.length}장의 사진이 있습니다.`)}catch{setStatus('목록을 불러오지 못했습니다. 권한과 연결을 확인해 주세요.')}finally{setBusy(false)}}
 async function download(item){setBusy(true);try{const {data,error}=await client.storage.from('wedding-guests').download(item.path);if(error)throw error;const url=URL.createObjectURL(data);const a=document.createElement('a');a.href=url;a.download=item.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}catch{setStatus('다운로드하지 못했습니다.')}finally{setBusy(false)}}
 async function remove(item){if(!window.confirm(`이 사진을 영구 삭제할까요?\n${item.name}\n저장소의 원본도 삭제되며 복구할 수 없습니다.`))return;setBusy(true);try{await deleteGuestPhoto(client.storage.from('wedding-guests'),item.path);setItems(current=>current.filter(i=>i.path!==item.path));setStatus('저장소에서 원본 사진을 삭제했습니다.')}catch{setStatus('삭제하지 못했습니다. 관리자 삭제 권한과 연결을 확인하고 다시 시도해 주세요.')}finally{setBusy(false)}}
 return <main className="admin-page"><section><div className="eyebrow">PRIVATE ARCHIVE</div><h1>우리의 하루</h1><p>신랑·신부 전용 사진 보관함</p>{!client?<p>저장소 연결 정보를 먼저 설정해 주세요.</p>:!session?<form onSubmit={login} className="admin-login"><label>이메일<input name="email" type="email" autoComplete="username" required/></label><label>비밀번호<input name="password" type="password" autoComplete="current-password" required/></label><button disabled={busy}>로그인</button></form>:<><button disabled={busy} onClick={()=>client.auth.signOut()}>로그아웃</button>{allowed&&<><p>사진을 확인하고 원본을 내려받거나 삭제할 수 있어요.</p><button disabled={busy} onClick={load}>사진 목록 새로고침</button><p role="status" aria-live="polite">{status}</p><div className="archive-tools"><label>파일명 검색<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="파일명 또는 날짜 검색"/></label><label>표시 개수<select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}><option value={20}>20장씩</option><option value={50}>50장씩</option><option value={100}>100장씩</option></select></label></div><p className="archive-count">전체 {items.length}장 · {filtered.length?`${(currentPage-1)*pageSize+1}–${Math.min(currentPage*pageSize,filtered.length)} / ${filtered.length}장`:'검색 결과 없음'}</p><ul className="admin-photos">{visible.map(i=><li key={i.path}><Preview path={i.path}/><div className="photo-details"><p title={i.path}>{i.name}</p><div className="photo-actions"><button disabled={busy} onClick={()=>download(i)}>원본 다운로드</button><button className="photo-delete" disabled={busy} onClick={()=>remove(i)} aria-label={`${i.name} 삭제`}>삭제</button></div></div></li>)}</ul><nav className="archive-pagination" aria-label="사진 목록 페이지"><button disabled={busy||currentPage===1} onClick={()=>setPage(currentPage-1)}>이전</button><span aria-live="polite">{currentPage} / {pages}</span><button disabled={busy||currentPage===pages} onClick={()=>setPage(currentPage+1)}>다음</button></nav></>}</>}{!allowed&&<p role="status">{status}</p>}<a href="/">청첩장으로 돌아가기</a></section></main>
}createRoot(document.getElementById('root')).render(<Admin/>);
