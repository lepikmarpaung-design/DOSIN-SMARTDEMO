const APP_VERSION = "DEMO-OFFLINE-1.0";
const OFFLINE_DEMO_MODE = true;
import React,{useEffect,useState} from 'react';
import {SafeAreaView,View,Text,StyleSheet,Pressable,ScrollView,TextInput,Alert,ActivityIndicator} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {Ionicons} from '@expo/vector-icons';
import {supabase} from './src/lib/supabase';
import {signIn,signUp,getProfile,getServices,getApplications,createApplication,uploadDocument,getApplicationDetail,updateApplicationStatus,subscribeToApplications,subscribeToMyApplications,createSignedUrl} from './src/services/api';

const P='#F52B82',DP='#B9165C',LP='#FFF0F7',G='#D4AF37',T='#343434',M='#777';
const svcIcon={ktp:'card-outline',kk:'people-outline',akta:'document-text-outline'};
const fallback=[{id:'ktp',name:'Pengajuan KTP',description:'Kartu Tanda Penduduk'},{id:'kk',name:'Pengajuan KK',description:'Kartu Keluarga'},{id:'akta',name:'Akta Kelahiran',description:'Administrasi kelahiran'},{id:'dom',name:'Surat Domisili',description:'Keterangan domisili'},{id:'usaha',name:'Surat Keterangan Usaha',description:'Administrasi usaha'},{id:'nikah',name:'Surat Pengantar Nikah',description:'Administrasi pernikahan'}];

function Logo(){return <View style={{alignItems:'center'}}><View style={s.logo}><Ionicons name="home" size={38} color="#fff"/><Text style={s.star}>✦</Text></View><Text style={s.logoText}>DOSIN</Text><Text style={s.logoSmart}>SMART</Text><Text style={s.tag}>Layanan Digital Desa</Text></View>}
function Button({children,onPress,outline=false}){return <Pressable style={[s.btn,outline&&s.btnOutline]} onPress={onPress}><Text style={[s.btnText,outline&&{color:P}]}>{children}</Text></Pressable>}
function Input({icon,...p}){return <View style={s.input}><Ionicons name={icon} size={18} color="#999"/><TextInput style={{flex:1,marginLeft:9,color:T}} placeholderTextColor="#aaa" {...p}/></View>}
function Header({title,back}){return <View style={s.header}><Pressable onPress={back} style={s.circle}><Ionicons name="arrow-back" size={21} color={T}/></Pressable><Text style={s.ht}>{title}</Text><View style={{width:40}}/></View>}
function Nav({go,active}){return <View style={s.nav}>{[['home','Beranda','home'],['grid','Layanan','services'],['document-text','Pengajuan','tracking'],['notifications','Notifikasi','notif'],['person','Profil','profile']].map(x=><Pressable key={x[1]} onPress={()=>go(x[2])} style={s.navitem}><Ionicons name={x[0]+(active===x[2]?'':'-outline')} size={21} color={active===x[2]?P:'#888'}/><Text style={[s.navtxt,active===x[2]&&{color:P}]}>{x[1]}</Text></Pressable>)}</View>}

function Login({go}){const[e,setE]=useState(''),[p,setP]=useState(''),[busy,setBusy]=useState(false);const submit=async()=>{setBusy(true);const{error}=await signIn(e,p);setBusy(false);if(error)Alert.alert('Login gagal',error.message)};return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.auth}><Logo/><Text style={s.welcome}>Selamat Datang</Text><Text style={s.muted}>Masuk ke DOSIN SMART</Text><View style={s.card}><Input icon="mail-outline" placeholder="Email" value={e} onChangeText={setE}/><Input icon="lock-closed-outline" placeholder="Password" secureTextEntry value={p} onChangeText={setP}/><Button onPress={submit}>{busy?'Memproses...':'Masuk'}</Button><Text style={s.or}>atau</Text><Button outline onPress={()=>go('register')}>Daftar sebagai Warga</Button></View></ScrollView></SafeAreaView>}
function Register({go}){const[n,setN]=useState(''),[e,setE]=useState(''),[p,setP]=useState(''),[nik,setNik]=useState(''),[hp,setHp]=useState('');const submit=async()=>{const{error}=await signUp({email:e,password:p,fullName:n,nik,phone:hp});if(error)Alert.alert('Pendaftaran gagal',error.message);else Alert.alert('Berhasil','Periksa email untuk verifikasi akun.',[{text:'OK',onPress:()=>go('login')}])};return <SafeAreaView style={s.safe}><Header title="Daftar Warga" back={()=>go('login')}/><ScrollView contentContainerStyle={s.page}><Logo/><View style={s.card}><Input icon="person-outline" placeholder="Nama lengkap" value={n} onChangeText={setN}/><Input icon="card-outline" placeholder="NIK" keyboardType="numeric" value={nik} onChangeText={setNik}/><Input icon="call-outline" placeholder="Nomor HP" value={hp} onChangeText={setHp}/><Input icon="mail-outline" placeholder="Email" value={e} onChangeText={setE}/><Input icon="lock-closed-outline" placeholder="Password" secureTextEntry value={p} onChangeText={setP}/><Button onPress={submit}>Daftar</Button></View></ScrollView></SafeAreaView>}

function Home({go,profile,apps}){return <SafeAreaView style={s.safe}><View style={s.homeTop}><View><Text style={s.muted}>Halo,</Text><Text style={s.name}>{profile?.full_name||'Warga'}</Text><Text style={s.role}>Warga Desa</Text></View><Pressable style={s.circle} onPress={()=>go('notif')}><Ionicons name="notifications-outline" size={21} color={P}/></Pressable></View><ScrollView contentContainerStyle={s.page}><View style={s.statuscard}><View style={s.serviceIcon}><Ionicons name="document-text-outline" size={24} color={P}/></View><View style={{flex:1}}><Text style={s.muted}>Pengajuan Terakhir</Text><Text style={s.title}>{apps[0]?.services?.name||'Belum ada pengajuan'}</Text><Text style={s.status}>{apps[0]?.status?.replaceAll('_',' ')||'Siap digunakan'}</Text></View></View><Text style={s.h2}>Layanan Utama</Text><View style={s.grid}>{(fallback).map(x=><Pressable key={x.id} style={s.service} onPress={()=>go('form',x)}><View style={s.serviceIcon}><Ionicons name={svcIcon[x.id]||'document-text-outline'} size={23} color={P}/></View><Text style={s.title}>{x.name.replace('Pengajuan ','')}</Text><Text style={s.muted}>{x.description}</Text></Pressable>)}</View><View style={s.banner}><Text style={s.bannerTitle}>Mudah • Cepat • Terpercaya</Text><Text style={s.muted}>Urus layanan desa dari mana saja.</Text></View></ScrollView><Nav go={go} active="home"/></SafeAreaView>}

function Services({go,services}){return <SafeAreaView style={s.safe}><Header title="Layanan Administrasi" back={()=>go('home')}/><ScrollView contentContainerStyle={s.page}>{(services.length?services:fallback).map(x=><Pressable style={s.list} key={x.id} onPress={()=>go('form',x)}><View style={s.serviceIcon}><Ionicons name={svcIcon[x.id]||'document-text-outline'} size={23} color={P}/></View><View style={{flex:1}}><Text style={s.title}>{x.name}</Text><Text style={s.muted}>{x.description}</Text></View><Ionicons name="chevron-forward" size={19} color="#aaa"/></Pressable>)}</ScrollView><Nav go={go} active="services"/></SafeAreaView>}

function Form({go,service,user,onCreated}){const[data,setData]=useState({nik:'',nama:user?.user_metadata?.full_name||'',alamat:''}),[docs,setDocs]=useState([]),[busy,setBusy]=useState(false);
 const pick=async(type)=>{const r=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/*'],copyToCacheDirectory:true});if(!r.canceled){const a=r.assets[0];setDocs(d=>[...d,{type,asset:a}])}};
const formErrors = validateServiceForm(selectedService?.name, formData);
      if (Object.keys(formErrors).length) {
        Alert.alert("Form belum lengkap", Object.values(formErrors)[0]);
        return;
      }
       const submit=async()=>{if(!data.nik||!data.nama)return Alert.alert('Lengkapi data','NIK dan nama wajib diisi.');setBusy(true);const{data:a,error}=await createApplication({userId:user.id,serviceId:service.id,formData:data});if(error){setBusy(false);return Alert.alert('Gagal membuat pengajuan',error.message)}for(const d of docs){const up=await uploadDocument({userId:user.id,applicationId:a.id,asset:d.asset,documentType:d.type});if(up.error){setBusy(false);return Alert.alert('Dokumen gagal',up.error.message)}}setBusy(false);onCreated();Alert.alert('Berhasil','Pengajuan '+a.application_no+' telah dikirim.')};
 return <SafeAreaView style={s.safe}><Header title={service.name} back={()=>go('services')}/><ScrollView contentContainerStyle={s.page}><Text style={s.h2}>Data Pemohon</Text><Input icon="card-outline" placeholder="NIK" value={data.nik} onChangeText={v=>setData({...data,nik:v})}/><Input icon="person-outline" placeholder="Nama lengkap" value={data.nama} onChangeText={v=>setData({...data,nama:v})}/><Input icon="location-outline" placeholder="Alamat lengkap" value={data.alamat} onChangeText={v=>setData({...data,alamat:v})}/><Text style={s.h2}>Dokumen Persyaratan</Text>{['Kartu Keluarga','Foto KTP','Dokumen Pendukung'].map(t=><Pressable key={t} style={s.upload} onPress={()=>pick(t)}><Ionicons name="cloud-upload-outline" size={26} color={P}/><View style={{flex:1}}><Text style={s.title}>{t}</Text><Text style={s.muted}>{docs.find(d=>d.type===t)?.asset.name||'Belum dipilih'}</Text></View><Text style={s.link}>Pilih</Text></Pressable>)}<Button onPress={submit}>{busy?'Mengirim...':'Kirim Pengajuan'}</Button></ScrollView></SafeAreaView>}

function Tracking({go,apps}){return <SafeAreaView style={s.safe}><Header title="Pengajuan Saya" back={()=>go('home')}/><ScrollView contentContainerStyle={s.page}>{apps.length===0?<Text style={s.muted}>Belum ada pengajuan.</Text>:apps.map(a=><Pressable style={s.list} key={a.id} onPress={()=>go('detail',a)}><View style={s.serviceIcon}><Ionicons name="document-text-outline" size={22} color={P}/></View><View style={{flex:1}}><Text style={s.title}>{a.services?.name}</Text><Text style={s.muted}>{a.application_no}</Text></View><Text style={s.status}>{a.status.replaceAll('_',' ')}</Text></Pressable>)}</ScrollView><Nav go={go} active="tracking"/></SafeAreaView>}

function Detail({go,app,user}){const[detail,setDetail]=useState(null);useEffect(()=>{getApplicationDetail(app.id).then(setDetail)},[app.id]);const open=async(path)=>{const{data,error}=await createSignedUrl(path);if(error)Alert.alert('Gagal membuka dokumen',error.message);else Alert.alert('Dokumen tersedia','URL aman dibuat selama 5 menit.')};return <SafeAreaView style={s.safe}><Header title="Detail Pengajuan" back={()=>go('tracking')}/><ScrollView contentContainerStyle={s.page}><View style={s.card}><Text style={s.title}>{app.services?.name}</Text><Text style={s.muted}>{app.application_no}</Text><Text style={s.status}>{app.status.replaceAll('_',' ')}</Text></View><Text style={s.h2}>Dokumen</Text>{detail?.documents?.map(d=><Pressable style={s.list} key={d.id} onPress={()=>open(d.file_path)}><Ionicons name="document-attach-outline" size={22} color={P}/><Text style={[s.title,{marginLeft:10}]}>{d.file_name}</Text></Pressable>)}<Text style={s.h2}>Riwayat Status</Text>{(detail?.history||[]).map(h=><View style={s.timeline} key={h.id}><View style={s.dot}/><View><Text style={s.title}>{h.status.replaceAll('_',' ')}</Text><Text style={s.muted}>{h.note||'Tidak ada catatan'}</Text></View></View>)}</ScrollView></SafeAreaView>}

function Notifications({go,user}){const[n,setN]=useState([]);useEffect(()=>{supabase.from('notifications').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).then(({data})=>setN(data||[]))},[user.id]);return <SafeAreaView style={s.safe}><Header title="Notifikasi" back={()=>go('home')}/><ScrollView contentContainerStyle={s.page}>{n.length?n.map(x=><View style={s.list} key={x.id}><View style={s.serviceIcon}><Ionicons name="notifications-outline" size={21} color={P}/></View><View style={{flex:1}}><Text style={s.title}>{x.title}</Text><Text style={s.muted}>{x.message}</Text></View></View>):<Text style={s.muted}>Belum ada notifikasi.</Text>}</ScrollView><Nav go={go} active="notif"/></SafeAreaView>}

function Profile({go,profile}){return <SafeAreaView style={s.safe}><Header title="Profil" back={()=>go('home')}/><ScrollView contentContainerStyle={s.page}><View style={s.profile}><View style={s.avatar}><Ionicons name="person" size={32} color={P}/></View><View><Text style={s.h2}>{profile?.full_name}</Text><Text style={s.muted}>{profile?.phone||'Warga Desa'}</Text></View></View><View style={s.list}><Ionicons name="card-outline" size={20} color={P}/><Text style={[s.title,{marginLeft:12}]}>NIK: {profile?.nik||'-'}</Text></View><Button outline onPress={()=>supabase.auth.signOut()}>Keluar</Button></ScrollView><Nav go={go} active="profile"/></SafeAreaView>}

function Admin({go,user}){const[apps,setApps]=useState([]),[loading,setLoading]=useState(true),[selected,setSelected]=useState(null);const load=()=>getApplications(user.id,true).then(r=>{setApps(r.data||[]);setLoading(false)});useEffect(()=>{load();const c=subscribeToApplications(load);return()=>supabase.removeChannel(c)},[]);const act=async(status)=>{const note=selected.note||'';const{error}=await updateApplicationStatus({applicationId:selected.id,status,note,adminId:user.id});if(error)Alert.alert('Gagal',error.message);else{Alert.alert('Berhasil','Status diperbarui dan notifikasi dikirim.');setSelected(null);load()}};return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page}><Logo/><Text style={s.h2}>Dashboard Admin Desa</Text><View style={s.grid}><View style={s.stat}><Text style={s.big}>{apps.filter(a=>a.status==='menunggu_verifikasi').length}</Text><Text style={s.muted}>Menunggu Verifikasi</Text></View><View style={s.stat}><Text style={s.big}>{apps.filter(a=>a.status==='diproses').length}</Text><Text style={s.muted}>Diproses</Text></View><View style={s.stat}><Text style={s.big}>{apps.filter(a=>a.status==='selesai').length}</Text><Text style={s.muted}>Selesai</Text></View><View style={s.stat}><Text style={s.big}>{apps.filter(a=>a.status==='perlu_perbaikan').length}</Text><Text style={s.muted}>Perbaikan</Text></View></View><Text style={s.h2}>Pengajuan Masuk</Text>{loading?<ActivityIndicator color={P}/>:apps.map(a=><Pressable style={s.list} key={a.id} onPress={()=>setSelected({...a,note:''})}><View style={s.serviceIcon}><Ionicons name="document-text-outline" size={22} color={P}/></View><View style={{flex:1}}><Text style={s.title}>{a.services?.name}</Text><Text style={s.muted}>{a.application_no} • {a.profiles?.full_name}</Text></View><Text style={s.status}>{a.status.replaceAll('_',' ')}</Text></Pressable>)}{selected&&<View style={s.modal}><Text style={s.h2}>{selected.services?.name}</Text><Text style={s.muted}>{selected.application_no} • {selected.profiles?.full_name}</Text><Input icon="create-outline" placeholder="Catatan admin" value={selected.note} onChangeText={v=>setSelected({...selected,note:v})}/><View style={s.actionrow}><Button onPress={()=>act('diproses')}>Proses</Button><Button onPress={()=>act('perlu_perbaikan')}>Perbaikan</Button><Button onPress={()=>act('disetujui')}>Setujui</Button></View><Button outline onPress={()=>setSelected(null)}>Tutup</Button></View>}</ScrollView></SafeAreaView>}


function DynamicServiceFields({serviceName, values, setValues}) {
  const fields = SERVICE_FORMS[serviceName] || [
    ["nik", "NIK", "number", 16],
    ["nama", "Nama Lengkap", "text"],
    ["alamat", "Alamat", "text"],
    ["keperluan", "Keperluan", "text"],
  ];
  return fields.map(([key,label,type,maxLength]) => (
    <TextInput
      key={key}
      value={values[key] || ""}
      onChangeText={(v) => setValues(prev => ({...prev, [key]: v}))}
      placeholder={label}
      keyboardType={type === "number" ? "numeric" : "default"}
      maxLength={maxLength}
      style={styles.input}
    />
  ));
}


const STATUS_LABELS = {
  menunggu_verifikasi: "Menunggu Verifikasi",
  diproses: "Diproses",
  perlu_perbaikan: "Perlu Perbaikan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  selesai: "Selesai",
};

const STATUS_COLORS = {
  menunggu_verifikasi: "#D4AF37",
  diproses: "#F52B82",
  perlu_perbaikan: "#E67E22",
  disetujui: "#2E9D5B",
  ditolak: "#C0392B",
  selesai: "#2C7BE5",
};

function StatusBadge({status}) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || "#777";
  return (
    <View style={{paddingHorizontal:10,paddingVertical:6,borderRadius:20,backgroundColor:"#fff",borderWidth:1,borderColor:color,alignSelf:"flex-start"}}>
      <Text style={{fontSize:11,fontWeight:"700",color}}>{label}</Text>
    </View>
  );
}

function EmptyState({title="Belum Ada Data", subtitle="Data akan tampil di sini."}) {
  return (
    <View style={{padding:28,alignItems:"center",justifyContent:"center"}}>
      <Text style={{fontSize:16,fontWeight:"700",color:"#343434",marginBottom:6}}>{title}</Text>
      <Text style={{fontSize:13,color:"#777",textAlign:"center"}}>{subtitle}</Text>
    </View>
  );
}


const FIELD_RULES = {
  nik: { required: true, length: 16, label: "NIK" },
  no_kk: { required: false, length: 16, label: "Nomor KK" },
  nama: { required: true, min: 3, label: "Nama Lengkap" },
  nama_anak: { required: true, min: 3, label: "Nama Anak" },
  nama_ayah: { required: true, min: 3, label: "Nama Ayah" },
  nama_ibu: { required: true, min: 3, label: "Nama Ibu" },
};

function validateServiceForm(serviceName, values) {
  const fields = SERVICE_FORMS[serviceName] || [];
  const errors = {};
  for (const [key, label] of fields.map(x => [x[0], x[1]])) {
    const rule = FIELD_RULES[key];
    const value = String(values[key] || "").trim();
    if (rule?.required && !value) errors[key] = `${label} wajib diisi`;
    if (value && rule?.length && value.length !== rule.length) errors[key] = `${label} harus ${rule.length} digit`;
    if (value && rule?.min && value.length < rule.min) errors[key] = `${label} terlalu pendek`;
  }
  return errors;
}

export default function App(){const[session,setSession]=useState(null),[profile,setProfile]=useState(null),[services,setServices]=useState([]),[apps,setApps]=useState([]),[screen,setScreen]=useState('login'),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)});const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>subscription.unsubscribe()},[]);
 useEffect(()=>{if(!session)return;const u=session.user;Promise.all([getProfile(u.id),getServices(),getApplications(u.id)]).then(([p,sv,a])=>{setProfile(p.data);setServices(sv.data||[]);setApps(a.data||[])});const c=subscribeToMyApplications(u.id,()=>getApplications(u.id).then(r=>setApps(r.data||[])));return()=>supabase.removeChannel(c)},[session]);
 const go=(x,data)=>{if(x==='form'||x==='detail')setSelected(data);setScreen(x)};const refresh=()=>getApplications(session.user.id).then(r=>setApps(r.data||[]));
 if(loading)return <SafeAreaView style={s.safe}><ActivityIndicator style={{marginTop:100}} color={P}/></SafeAreaView>;
 if(!session)return screen==='register'?<Register go={go}/>:<Login go={go}/>;
 if(profile?.role==='admin'&&screen==='admin')return <Admin go={go} user={session.user}/>;
 if(screen==='services')return <Services go={go} services={services}/>;
 if(screen==='form')return <Form go={go} service={selected} user={session.user} onCreated={refresh}/>;
 if(screen==='tracking')return <Tracking go={go} apps={apps}/>;
 if(screen==='detail')return <Detail go={go} app={selected} user={session.user}/>;
 if(screen==='profile')return <Profile go={go} profile={profile}/>;
 if(screen==='notif')return <Notifications go={go} user={session.user}/>;
 if(screen==='admin')return <Admin go={go} user={session.user}/>;
 return <Home go={go} profile={profile} apps={apps}/>;
}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#FFF9FC'},auth:{padding:28,justifyContent:'center',flexGrow:1},page:{padding:18,paddingBottom:100},
 logo:{width:78,height:78,borderRadius:27,backgroundColor:P,alignItems:'center',justifyContent:'center'},star:{position:'absolute',right:7,top:2,color:G,fontSize:21},
 logoText:{fontSize:36,fontWeight:'900',color:P,letterSpacing:2},logoSmart:{fontSize:16,letterSpacing:7,color:DP,fontWeight:'700'},tag:{fontSize:11,color:M,letterSpacing:1},
 welcome:{fontSize:25,fontWeight:'800',color:T,marginTop:25},muted:{fontSize:12,color:M,lineHeight:18},
 card:{backgroundColor:'#fff',borderRadius:22,padding:18,marginTop:18,elevation:2},input:{height:52,borderWidth:1,borderColor:'#eee',borderRadius:14,flexDirection:'row',alignItems:'center',paddingHorizontal:13,marginBottom:11},
 btn:{height:52,borderRadius:15,backgroundColor:P,alignItems:'center',justifyContent:'center',marginTop:10},btnOutline:{backgroundColor:'#fff',borderWidth:1,borderColor:'#FFD0E4'},btnText:{color:'#fff',fontWeight:'800'},or:{textAlign:'center',color:'#aaa',marginVertical:12},
 header:{height:62,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:'#eee'},circle:{width:40,height:40,borderRadius:20,backgroundColor:LP,alignItems:'center',justifyContent:'center'},ht:{fontWeight:'800',fontSize:17,color:T},
 homeTop:{backgroundColor:'#fff',padding:18,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},name:{fontSize:21,fontWeight:'800',color:T},role:{color:P,fontSize:11},
 statuscard:{backgroundColor:'#fff',borderRadius:20,padding:15,flexDirection:'row',alignItems:'center',elevation:2},serviceIcon:{width:46,height:46,borderRadius:15,backgroundColor:LP,alignItems:'center',justifyContent:'center',marginRight:11},
 title:{fontWeight:'800',fontSize:13,color:T},h2:{fontWeight:'800',fontSize:18,color:T,marginTop:18,marginBottom:8},status:{fontSize:10,color:P,fontWeight:'800',marginTop:4},
 grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},service:{width:'31.5%',backgroundColor:'#fff',borderRadius:18,padding:10,minHeight:125,marginBottom:10},
 banner:{backgroundColor:LP,padding:17,borderRadius:20,marginTop:7},bannerTitle:{fontWeight:'900',color:P,fontSize:14},list:{backgroundColor:'#fff',borderRadius:18,padding:14,marginBottom:10,flexDirection:'row',alignItems:'center'},
 link:{color:P,fontWeight:'800',fontSize:11},upload:{backgroundColor:'#fff',borderRadius:18,padding:14,marginBottom:10,flexDirection:'row',alignItems:'center',gap:10},
 nav:{height:72,backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#eee',flexDirection:'row',justifyContent:'space-around',paddingTop:9},navitem:{alignItems:'center',width:'20%'},navtxt:{fontSize:9,color:'#888',marginTop:3,fontWeight:'700'},
 timeline:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:13,borderLeftWidth:2,borderLeftColor:'#FFD7E8',paddingLeft:15,marginLeft:7},dot:{width:11,height:11,borderRadius:6,backgroundColor:P,position:'absolute',left:-7},
 profile:{backgroundColor:'#fff',borderRadius:20,padding:18,flexDirection:'row',alignItems:'center',gap:14},avatar:{width:66,height:66,borderRadius:33,backgroundColor:LP,alignItems:'center',justifyContent:'center'},
 stat:{width:'48%',backgroundColor:'#fff',borderRadius:18,padding:15,marginBottom:10},big:{fontSize:27,fontWeight:'900',color:P},modal:{backgroundColor:'#fff',borderRadius:22,padding:18,marginTop:18,elevation:5},actionrow:{gap:4}
});
